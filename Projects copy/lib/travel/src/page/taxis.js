"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxisPage = void 0;
const easings_1 = require("../lib/easings");
const page_1 = require("./page");
const three_1 = require("three");
const Line2_js_1 = require("three/examples/jsm/lines/Line2.js");
const LineMaterial_js_1 = require("three/examples/jsm/lines/LineMaterial.js");
const LineGeometry_js_1 = require("three/examples/jsm/lines/LineGeometry.js");
const GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
const taxi_path_json_1 = require("../../public/paths/taxi-path.json");
const taxi_walking_path_json_1 = require("../../public/paths/taxi-walking-path.json");
const taxi_camera_path_json_1 = require("../../public/paths/taxi-camera-path.json");
const dotted_directions_line_1 = require("../lib/dotted-directions-line");
const origin_marker_1 = require("../lib/origin-marker");
const threejs_overlay_view_1 = require("../../../oobe/src/lib/map/threejs-overlay-view");
const icon_marker_3d_1 = require("../../../oobe/src/lib/three/icon-marker-3d");
const taxi_gltf_1 = require("url:../../public/models/taxi.gltf");
const taxi_icon_svg_1 = require("url:../../public/images/taxi-icon.svg");
const accomodation_marker_yellow_svg_1 = require("url:../../public/images/accomodation-marker-yellow.svg");
const ANIMATION_DURATION = 40000;
const START_DELAY = 1000;
const CAR_FRONT = new three_1.Vector3(1, 0, 0);
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
const tmpVec3 = new three_1.Vector3();
const gltfLoader = new GLTFLoader_1.GLTFLoader();
let car;
let update;
let sceneStartTimestamp = 0; //timestamp of when the scene was last started, so we can reset the taxi progress on page change
let taxiCurve;
let cameraCurve; // a less accurate version of taxi curve to keep movements smooth
let zoomListener;
function getCarScale(zoom) {
    return 0.1 * Math.pow(1.7, 25 - zoom);
}
function initScene(overlay, basemap) {
    const scene = overlay.getScene();
    // walking path
    const walkingLine = new dotted_directions_line_1.default(taxi_walking_path_json_1.default.map(([lat, lng]) => overlay.latLngAltToVector2({ lat, lng })), {
        color: 0xf4b400,
        pointSize: 1,
        pointSpacing: 2
    });
    scene.add(walkingLine);
    // taxi path
    taxiCurve = new three_1.CatmullRomCurve3(taxi_path_json_1.default.map(({ lat, lng }) => overlay.latLngAltToVector3({ lat, lng, altitude: 0 })), false, 'centripetal', 0.2);
    const taxiCurvePoints = taxiCurve.getSpacedPoints(10 * taxiCurve.points.length);
    taxiCurve.arcLengthDivisions = ARC_LENGTH_DIVISIONS;
    const taxiPositions = new Float32Array(taxiCurvePoints.length * 3);
    for (let i = 0; i < taxiCurvePoints.length; i++) {
        taxiCurvePoints[i].toArray(taxiPositions, 3 * i);
    }
    const taxiLineGeometry = new LineGeometry_js_1.LineGeometry();
    taxiLineGeometry.setPositions(taxiPositions);
    const taxiLineMaterial = new LineMaterial_js_1.LineMaterial({
        color: 0xf4b400,
        linewidth: 4,
        vertexColors: false,
        dashed: false
    });
    const taxiLine = new Line2_js_1.Line2(taxiLineGeometry, taxiLineMaterial);
    taxiLine.computeLineDistances();
    scene.add(taxiLine);
    // camera path
    cameraCurve = new three_1.CatmullRomCurve3(taxi_camera_path_json_1.default.map(({ lat, lng }) => overlay.latLngAltToVector3({ lat, lng, altitude: 0 })), false, 'centripetal', 0.2);
    /// load and add the car model
    gltfLoader.load(taxi_gltf_1.default, gltf => {
        car = gltf.scene;
        car.scale.setScalar(getCarScale(initialViewport.zoom));
        // workaround for disappearing models bug
        car.traverse((obj) => {
            if (obj.geometry) {
                obj.frustumCulled = false;
            }
        });
        scene.add(car);
    });
    // marker
    const originMarker = new origin_marker_1.default({ size: 3, color: THEME_COLOR });
    const [lat, lng] = taxi_walking_path_json_1.default[0]; //start of walking path
    overlay.latLngAltToVector3({ lat, lng, altitude: 0 }, originMarker.position);
    scene.add(originMarker);
    const taxiMarker = new icon_marker_3d_1.default({
        iconSrc: taxi_icon_svg_1.default,
        iconSize: 4,
        color: THEME_COLOR,
        labelHeight: 0,
        baseZoom: initialViewport.zoom
    });
    const taxiMarkerLatOffset = 0.00009;
    overlay.latLngAltToVector3({
        lat: taxi_path_json_1.default[0].lat + taxiMarkerLatOffset,
        lng: taxi_path_json_1.default[0].lng,
        altitude: 0
    }, taxiMarker.position);
    scene.add(taxiMarker);
    const hotelMarker = new icon_marker_3d_1.default({
        iconSrc: accomodation_marker_yellow_svg_1.default,
        iconSize: 12,
        color: THEME_COLOR,
        labelHeight: 10,
        baseZoom: TARGET_ZOOM
    });
    overlay.latLngAltToVector3(ACCOMODATION_MARKER_POSITION, hotelMarker.position);
    scene.add(hotelMarker);
    const mapContainer = basemap.getMapInstance().getDiv();
    update = () => {
        const map = basemap.getMapInstance();
        const heading = map.getHeading();
        const tilt = map.getTilt();
        const zoom = map.getZoom();
        originMarker.update({ heading, tilt });
        taxiMarker.update({ heading, tilt, zoom });
        hotelMarker.update({ heading, tilt, zoom });
        taxiLineMaterial.resolution?.set(mapContainer.offsetWidth, mapContainer.offsetHeight);
        if (!car) {
            return;
        }
        let animationProgress = (performance.now() - START_DELAY - sceneStartTimestamp) /
            ANIMATION_DURATION;
        if (animationProgress > 1)
            return;
        if (animationProgress < 0)
            animationProgress = 0;
        // car position/rotation
        const easeInEaseOutProgressCubic = easings_1.easeInOutCubic(animationProgress);
        taxiCurve.getPointAt(easeInEaseOutProgressCubic, car.position);
        car.quaternion.setFromUnitVectors(CAR_FRONT, taxiCurve.getTangentAt(easeInEaseOutProgressCubic, tmpVec3));
        // center
        const cameraPos = cameraCurve.getPointAt(easeInEaseOutProgressCubic);
        const { lat, lng } = overlay.vector3ToLatLngAlt(cameraPos);
        // zoom
        const calcZoom = initialViewport.zoom -
            ZOOM_AMPLITUDE * Math.sin(Math.PI * animationProgress);
        const zoomMultiplier = easings_1.easeInSine(animationProgress);
        const newZoom = zoomMultiplier * TARGET_ZOOM + (1 - zoomMultiplier) * calcZoom;
        // heading
        const newHeadingMultiplier = easings_1.easeInOutQuad((animationProgress - HEADING_START) * (1 / (1 - HEADING_START)));
        const newHeading = animationProgress > HEADING_START
            ? newHeadingMultiplier * TARGET_HEADING +
                (1 - newHeadingMultiplier) * initialViewport.heading
            : initialViewport.heading;
        basemap.setCamera({
            center: { lat, lng },
            zoom: newZoom,
            heading: newHeading
        });
    };
    return { scene, sceneAnchor: initialViewport, update };
}
class TaxisPage extends page_1.Page {
    initialize() {
        this.overlay = new threejs_overlay_view_1.default({
            lat: initialViewport.lat,
            lng: initialViewport.lng,
            altitude: 0
        });
        initScene(this.overlay, this.basemap);
        this.mapOverlays.push(this.overlay);
    }
    start() {
        const { lat, lng, zoom, heading, tilt } = initialViewport;
        this.basemap.setCamera({
            center: { lat, lng },
            tilt,
            zoom,
            heading
        });
        sceneStartTimestamp = performance.now();
        this.overlay.update = update;
        this.overlay.requestRedraw();
        this.overlay.getScene().visible = true;
        const map = this.basemap.getMapInstance();
        car?.scale.setScalar(getCarScale(map.getZoom()));
        zoomListener = google.maps.event.addListener(map, 'zoom_changed', () => {
            car?.scale.setScalar(getCarScale(map.getZoom()));
        });
    }
    stop() {
        this.overlay.update = null;
        this.overlay.getScene().visible = false;
        if (zoomListener)
            google.maps.event.removeListener(zoomListener);
    }
}
exports.TaxisPage = TaxisPage;
