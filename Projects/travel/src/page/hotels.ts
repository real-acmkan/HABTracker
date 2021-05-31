import {Page} from './page';
import {easeInOutQuad} from '../lib/easings';
import {
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  Shape,
  Vector3
} from 'three';
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry';
import type {LineGeometry} from 'three/examples/jsm/lines/LineGeometry.js';

import wireframePath from '../../public/paths/hotels-path.json';
import ACCOMODATION_ICON from 'url:../../public/images/accomodation-marker-green.svg';
import type {Basemap} from '../lib/basemap';
import ThreeJSOverlayView from '../../../oobe/src/lib/map/threejs-overlay-view';
import IconMarker3d from '../../../oobe/src/lib/three/icon-marker-3d';

const ANIMATION_DURATION = 4000;
const TARGET_HEADING = 200;
const START_DELAY = 100;
const BUILDING_HEIGHT = 32.1;
const UP_VECTOR = new Vector3(0, 1, 0);
const LINE_MATERIAL_COLOR = 0x0f9d58;

const initialViewport = {
  lat: 51.50706959210838,
  lng: -0.14162040885065785,
  heading: 100,
  tilt: 67.5,
  zoom: 18.2
};

const ACCOMODATION_MARKER_POSITION = {
  lat: initialViewport.lat,
  lng: initialViewport.lng,
  altitude: BUILDING_HEIGHT
};

let update: () => void;
let sceneStartTimestamp = 0;

function initScene(
  overlay: ThreeJSOverlayView,
  mapContainer: HTMLElement,
  basemap: Basemap
) {
  const scene = overlay.getScene();

  // wireframe
  const points = wireframePath.map(({lat, lng}) =>
    overlay.latLngAltToVector3({lat, lng, altitude: 0})
  );
  const positions = new Float32Array(18 * points.length).fill(0);

  const offset = new Vector3(0, BUILDING_HEIGHT, 0);
  const pointsTop = points.map(p => p.clone().add(offset));

  for (let i = 0, n = points.length; i < n; i++) {
    points[i].toArray(positions, 6 * i);
    points[(i + 1) % n].toArray(positions, 6 * i + 3);
  }

  let topOffset = points.length * 6;
  for (let i = 0, n = pointsTop.length; i < n; i++) {
    pointsTop[i].toArray(positions, topOffset + 6 * i);
    pointsTop[(i + 1) % n].toArray(positions, topOffset + 6 * i + 3);
  }

  let vertEdgeOffset = points.length * 12;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const pTop = pointsTop[i];

    p.toArray(positions, vertEdgeOffset + 6 * i);
    pTop.toArray(positions, vertEdgeOffset + 6 * i + 3);
  }

  const lineGeometry = new LineSegmentsGeometry();
  lineGeometry.instanceCount = 3 * points.length;
  lineGeometry.setPositions(positions);
  const lineMaterial = new LineMaterial({
    color: LINE_MATERIAL_COLOR,
    linewidth: 1,
    vertexColors: false,
    dashed: false
  });

  const line = new Line2(lineGeometry as LineGeometry, lineMaterial);
  line.computeLineDistances();

  scene.add(line);

  //hotels color
  const hotelMaterial = new MeshStandardMaterial({
    transparent: true,
    opacity: 0.5,
    color: 0x00ff00
  });

  const roofShape = new Shape();
  points.forEach((p, i) => {
    i === 0 ? roofShape.moveTo(p.z, p.x) : roofShape.lineTo(p.z, p.x);
  });

  const extrudeSettings = {
    depth: BUILDING_HEIGHT,
    bevelEnabled: false
  };
  const roofGeometry = new ExtrudeGeometry(roofShape, extrudeSettings);
  const roof = new Mesh(roofGeometry, hotelMaterial);
  roof.lookAt(UP_VECTOR);
  roof.rotateZ(Math.PI * 1.5);
  scene.add(roof);

  // accomodation marker
  const accomodationMarker = new IconMarker3d({
    iconSrc: ACCOMODATION_ICON,
    iconSize: 12,
    color: LINE_MATERIAL_COLOR,
    labelHeight: 10
  });

  overlay.latLngAltToVector3(
    ACCOMODATION_MARKER_POSITION,
    accomodationMarker.position
  );

  scene.add(accomodationMarker);

  //update
  update = () => {
    lineMaterial.resolution.set(
      mapContainer.offsetWidth,
      mapContainer.offsetHeight
    );

    const map = basemap.getMapInstance();
    const heading = map.getHeading() || 0;
    const tilt = map.getTilt() || 0;
    accomodationMarker.update({heading, tilt});

    const sceneTime = performance.now() - START_DELAY - sceneStartTimestamp;

    if (sceneTime > ANIMATION_DURATION || sceneTime < 0) return;

    const animationProgress = easeInOutQuad(sceneTime / ANIMATION_DURATION);
    const newHeading =
      animationProgress * TARGET_HEADING +
      (1 - animationProgress) * initialViewport.heading;

    basemap.setCamera({heading: newHeading});
  };

  return {scene, sceneAnchor: initialViewport, update};
}

export class HotelsPage extends Page {
  private overlay?: ThreeJSOverlayView;

  initialize() {
    this.overlay = new ThreeJSOverlayView({
      lat: initialViewport.lat,
      lng: initialViewport.lng,
      altitude: 0
    });
    initScene(this.overlay, this.rootEl, this.basemap);
    this.mapOverlays.push(this.overlay);
  }

  start() {
    const {lat, lng, zoom, heading, tilt} = initialViewport;

    sceneStartTimestamp = performance.now();
    this.basemap.setCamera({
      center: {lat, lng},
      tilt,
      zoom,
      heading
    });

    this.overlay!.update = update;
    this.overlay!.requestRedraw();
  }

  stop() {}
}
