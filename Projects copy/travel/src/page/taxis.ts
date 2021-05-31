import {easeInOutCubic, easeInOutQuad, easeInSine} from '../lib/easings';
import {Page} from './page';
import type {Basemap} from '../lib/basemap';

import {CatmullRomCurve3, Mesh, Object3D, Vector3} from 'three';

import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

import taxiPath from '../../public/paths/taxi-path.json';
import walkingPath from '../../public/paths/taxi-walking-path.json';
import cameraPath from '../../public/paths/taxi-camera-path.json';
import DottedDirectionsLine from '../lib/dotted-directions-line';
import OriginMarker from '../lib/origin-marker';
import ThreeJSOverlayView from '../../../oobe/src/lib/map/threejs-overlay-view';
import IconMarker3d from '../../../oobe/src/lib/three/icon-marker-3d';

import CAR_MODEL_URL from 'url:../../public/models/taxi.gltf';
import TAXI_ICON from 'url:../../public/images/taxi-icon.svg';
import ACCOMODATION_ICON from 'url:../../public/images/accomodation-marker-yellow.svg';

const ANIMATION_DURATION = 40000;
const START_DELAY = 1000;
const CAR_FRONT = new Vector3(1, 0, 0);
const ARC_LENGTH_DIVISIONS = 5000; // keep this high enough to have linear movement
const ACCOMODATION_MARKER_POSITION = {
  lat: 51.50706959210838,
  lng: -0.14162040885065785,
  altitude: 32.1
};
const TARGET_ZOOM = 18;
const ZOOM_AMPLITUDE = 11.5; // how many zoom levels do we zoom out on the journey
const TARGET_HEADING = 160;
const HEADING_START = 0.85; // at how much of animation progress do we start turning the heading
const THEME_COLOR = 0xf4b400;

const initialViewport = {
  lat: 51.469777919213854,
  lng: -0.4520268594304433,
  heading: 73.99999999999994,
  tilt: 90,
  zoom: 21
};

const tmpVec3 = new Vector3();
const gltfLoader = new GLTFLoader();

let car: Object3D;
let update: () => void;
let sceneStartTimestamp = 0; //timestamp of when the scene was last started, so we can reset the taxi progress on page change
let taxiCurve: CatmullRomCurve3;
let cameraCurve: CatmullRomCurve3; // a less accurate version of taxi curve to keep movements smooth
let zoomListener: google.maps.MapsEventListener;

function getCarScale(zoom: number): number {
  return 0.1 * Math.pow(1.7, 25 - zoom);
}

function initScene(overlay: ThreeJSOverlayView, basemap: Basemap) {
  const scene = overlay.getScene();

  // walking path
  const walkingLine = new DottedDirectionsLine(
    walkingPath.map(([lat, lng]) => overlay.latLngAltToVector2({lat, lng})),
    {
      color: 0xf4b400,
      pointSize: 1,
      pointSpacing: 2
    }
  );
  scene.add(walkingLine);

  // taxi path
  taxiCurve = new CatmullRomCurve3(
    taxiPath.map(({lat, lng}) =>
      overlay.latLngAltToVector3({lat, lng, altitude: 0})
    ),
    false,
    'centripetal',
    0.2
  );

  const taxiCurvePoints = taxiCurve.getSpacedPoints(
    10 * taxiCurve.points.length
  );
  taxiCurve.arcLengthDivisions = ARC_LENGTH_DIVISIONS;

  const taxiPositions = new Float32Array(taxiCurvePoints.length * 3);

  for (let i = 0; i < taxiCurvePoints.length; i++) {
    taxiCurvePoints[i].toArray(taxiPositions, 3 * i);
  }

  const taxiLineGeometry = new LineGeometry();
  taxiLineGeometry.setPositions(taxiPositions);
  const taxiLineMaterial = new LineMaterial({
    color: 0xf4b400,
    linewidth: 4,
    vertexColors: false,
    dashed: false
  });

  const taxiLine = new Line2(taxiLineGeometry, taxiLineMaterial);
  taxiLine.computeLineDistances();
  scene.add(taxiLine);

  // camera path
  cameraCurve = new CatmullRomCurve3(
    cameraPath.map(({lat, lng}) =>
      overlay.latLngAltToVector3({lat, lng, altitude: 0})
    ),
    false,
    'centripetal',
    0.2
  );

  /// load and add the car model
  gltfLoader.load(CAR_MODEL_URL, gltf => {
    car = gltf.scene;
    car.scale.setScalar(getCarScale(initialViewport.zoom));
    // workaround for disappearing models bug
    car.traverse((obj: Object3D) => {
      if ((obj as Mesh).geometry) {
        obj.frustumCulled = false;
      }
    });
    scene.add(car);
  });

  // marker
  const originMarker = new OriginMarker({size: 3, color: THEME_COLOR});
  const [lat, lng] = walkingPath[0]; //start of walking path
  overlay.latLngAltToVector3({lat, lng, altitude: 0}, originMarker.position);
  scene.add(originMarker);

  const taxiMarker = new IconMarker3d({
    iconSrc: TAXI_ICON,
    iconSize: 4,
    color: THEME_COLOR,
    labelHeight: 0,
    baseZoom: initialViewport.zoom
  });

  const taxiMarkerLatOffset = 0.00009;
  overlay.latLngAltToVector3(
    {
      lat: taxiPath[0].lat + taxiMarkerLatOffset,
      lng: taxiPath[0].lng,
      altitude: 0
    },
    taxiMarker.position
  );
  scene.add(taxiMarker);

  const hotelMarker = new IconMarker3d({
    iconSrc: ACCOMODATION_ICON,
    iconSize: 12,
    color: THEME_COLOR,
    labelHeight: 10,
    baseZoom: TARGET_ZOOM
  });
  overlay.latLngAltToVector3(
    ACCOMODATION_MARKER_POSITION,
    hotelMarker.position
  );
  scene.add(hotelMarker);

  const mapContainer = basemap.getMapInstance().getDiv() as HTMLCanvasElement;

  update = () => {
    const map = basemap.getMapInstance();
    const heading = map.getHeading();
    const tilt = map.getTilt();
    const zoom = map.getZoom();

    originMarker.update({heading, tilt});
    taxiMarker.update({heading, tilt, zoom});
    hotelMarker.update({heading, tilt, zoom});

    taxiLineMaterial.resolution?.set(
      mapContainer.offsetWidth,
      mapContainer.offsetHeight
    );

    if (!car) {
      return;
    }

    let animationProgress =
      (performance.now() - START_DELAY - sceneStartTimestamp) /
      ANIMATION_DURATION;

    if (animationProgress > 1) return;
    if (animationProgress < 0) animationProgress = 0;

    // car position/rotation
    const easeInEaseOutProgressCubic = easeInOutCubic(animationProgress);

    taxiCurve.getPointAt(easeInEaseOutProgressCubic, car.position);
    car.quaternion.setFromUnitVectors(
      CAR_FRONT,
      taxiCurve.getTangentAt(easeInEaseOutProgressCubic, tmpVec3)
    );

    // center
    const cameraPos = cameraCurve.getPointAt(easeInEaseOutProgressCubic);
    const {lat, lng} = overlay.vector3ToLatLngAlt(cameraPos);

    // zoom
    const calcZoom =
      initialViewport.zoom -
      ZOOM_AMPLITUDE * Math.sin(Math.PI * animationProgress);

    const zoomMultiplier = easeInSine(animationProgress);
    const newZoom =
      zoomMultiplier * TARGET_ZOOM + (1 - zoomMultiplier) * calcZoom;

    // heading
    const newHeadingMultiplier = easeInOutQuad(
      (animationProgress - HEADING_START) * (1 / (1 - HEADING_START))
    );

    const newHeading =
      animationProgress > HEADING_START
        ? newHeadingMultiplier * TARGET_HEADING +
          (1 - newHeadingMultiplier) * initialViewport.heading
        : initialViewport.heading;

    basemap.setCamera({
      center: {lat, lng},
      zoom: newZoom,
      heading: newHeading
    });
  };

  return {scene, sceneAnchor: initialViewport, update};
}

export class TaxisPage extends Page {
  private overlay?: ThreeJSOverlayView;

  initialize() {
    this.overlay = new ThreeJSOverlayView({
      lat: initialViewport.lat,
      lng: initialViewport.lng,
      altitude: 0
    });
    initScene(this.overlay, this.basemap);
    this.mapOverlays.push(this.overlay);
  }

  start() {
    const {lat, lng, zoom, heading, tilt} = initialViewport;

    this.basemap.setCamera({
      center: {lat, lng},
      tilt,
      zoom,
      heading
    });

    sceneStartTimestamp = performance.now();
    this.overlay!.update = update;
    this.overlay!.requestRedraw();
    this.overlay!.getScene()!.visible = true;

    const map = this.basemap.getMapInstance();

    car?.scale.setScalar(getCarScale(map.getZoom()!));
    zoomListener = google.maps.event.addListener(map, 'zoom_changed', () => {
      car?.scale.setScalar(getCarScale(map.getZoom()!));
    });
  }
  stop() {
    this.overlay!.update = null;
    this.overlay!.getScene()!.visible = false;

    if (zoomListener) google.maps.event.removeListener(zoomListener);
  }
}
