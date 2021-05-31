"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsPage = void 0;
const page_1 = require("./page");
const three_1 = require("three");
const Line2_js_1 = require("three/examples/jsm/lines/Line2.js");
const LineGeometry_js_1 = require("three/examples/jsm/lines/LineGeometry.js");
const GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
const LineMaterial_js_1 = require("three/examples/jsm/lines/LineMaterial.js");
const easings_1 = require("../lib/easings");
const flight_camera_path_json_1 = require("../../public/paths/flight-camera-path.json");
const flight_path_json_1 = require("../../public/paths/flight-path.json");
const plane_gltf_1 = require("url:../../public/models/plane.gltf");
const departure_icon_svg_1 = require("url:../../public/images/departure-icon.svg");
const arrival_icon_svg_1 = require("url:../../public/images/arrival-icon.svg");
const threejs_overlay_view_1 = require("../../../oobe/src/lib/map/threejs-overlay-view");
const icon_marker_3d_1 = require("../../../oobe/src/lib/three/icon-marker-3d");
const ANIMATION_DURATION = 22000;
const START_DELAY = 2000;
const END_DELAY = 2000;
const PLANE_FRONT = new three_1.Vector3(-1, 0, 0);
const ZOOM_AMPLITUDE = 5; // how many zoom levels do we zoom out on the journey
const THEME_COLOR = 0x285f4;
const MARKER_SIZE = 400;
const FLIGHT_MARKER_LAT_OFFSET = 0.01;
const initialViewport = {
    lat: 50.18282186160978,
    lng: 1.3842773437499998,
    altitude: 0,
    tilt: 30,
    heading: 0,
    zoom: 14
};
const tmpVec3 = new three_1.Vector3();
const gltfLoader = new GLTFLoader_1.GLTFLoader();
let plane;
let sceneStartTimestamp = 0; //timestamp of when the scene was last started, so we can reset the flight progress
let update;
let cameraCurve;
let zoomListener;
function getPlaneScale(zoom) {
    return 0.2 * Math.pow(1.7, 25 - zoom);
}
function initScene(overlay, basemap) {
    const scene = overlay.getScene();
    const animationPath = new three_1.CatmullRomCurve3(flight_path_json_1.default.features[0].geometry.coordinates.map(([lng, lat, altitude]) => overlay.latLngAltToVector3({ lat, lng, altitude })));
    const curvePoints = animationPath.getSpacedPoints(10 * animationPath.points.length);
    const positions = new Float32Array(curvePoints.length * 3);
    for (let i = 0; i < curvePoints.length; i++) {
        curvePoints[i].toArray(positions, 3 * i);
    }
    const lineGeometry = new LineGeometry_js_1.LineGeometry();
    lineGeometry.setPositions(positions);
    const lineMaterial = new LineMaterial_js_1.LineMaterial({
        color: THEME_COLOR,
        linewidth: 4,
        vertexColors: false,
        dashed: false
    });
    const line = new Line2_js_1.Line2(lineGeometry, lineMaterial);
    line.computeLineDistances();
    scene.add(line);
    // camera path
    cameraCurve = new three_1.CatmullRomCurve3(flight_camera_path_json_1.default.map(({ lat, lng }) => overlay.latLngAltToVector3({ lat, lng, altitude: 0 })), false, 'centripetal', 0.2);
    // marker
    const departureMarker = new icon_marker_3d_1.default({
        iconSrc: departure_icon_svg_1.default,
        iconSize: MARKER_SIZE,
        color: THEME_COLOR,
        labelHeight: 0,
        baseZoom: initialViewport.zoom
    });
    const arrivalMarker = new icon_marker_3d_1.default({
        iconSrc: arrival_icon_svg_1.default,
        iconSize: MARKER_SIZE,
        color: THEME_COLOR,
        labelHeight: 0,
        baseZoom: initialViewport.zoom
    });
    const flightCoordinates = flight_path_json_1.default.features[0].geometry.coordinates;
    const flightCoordinatesStart = flightCoordinates[0];
    const flightCoordinatesEnd = flightCoordinates[flightCoordinates.length - 1];
    overlay.latLngAltToVector3({
        lng: flightCoordinatesStart[0],
        lat: flightCoordinatesStart[1] + FLIGHT_MARKER_LAT_OFFSET,
        altitude: flightCoordinatesStart[2]
    }, departureMarker.position);
    overlay.latLngAltToVector3({
        lng: flightCoordinatesEnd[0],
        lat: flightCoordinatesEnd[1] + FLIGHT_MARKER_LAT_OFFSET,
        altitude: flightCoordinatesEnd[2]
    }, arrivalMarker.position);
    scene.add(departureMarker);
    scene.add(arrivalMarker);
    /// load and add the plane model
    gltfLoader.load(plane_gltf_1.default, gltf => {
        plane = gltf.scene;
        scene.add(plane);
        overlay.requestRedraw();
    });
    const mapContainer = basemap.getMapInstance().getDiv();
    update = () => {
        lineMaterial.resolution?.set(mapContainer.offsetWidth, mapContainer.offsetHeight);
        const map = basemap.getMapInstance();
        const heading = map.getHeading() || 0;
        const tilt = map.getTilt() || 0;
        const zoom = map.getZoom() || 0;
        departureMarker.update({ heading, tilt, zoom });
        arrivalMarker.update({ heading, tilt, zoom });
        if (!plane) {
            return;
        }
        let animationProgress = ((performance.now() - START_DELAY - sceneStartTimestamp) %
            (ANIMATION_DURATION + END_DELAY)) /
            ANIMATION_DURATION;
        if (animationProgress < 0)
            animationProgress = 0;
        if (animationProgress > 1)
            animationProgress = 1;
        // plane position/rotation
        const easeInEaseOutProgress = easings_1.easeInOutCubic(animationProgress);
        animationPath.getPointAt(easeInEaseOutProgress, plane.position);
        plane.quaternion.setFromUnitVectors(PLANE_FRONT, animationPath.getTangentAt(easeInEaseOutProgress, tmpVec3));
        // center
        const cameraPos = cameraCurve.getPointAt(easeInEaseOutProgress);
        const { lat, lng } = overlay.vector3ToLatLngAlt(cameraPos);
        // zoom
        const calcZoom = initialViewport.zoom -
            ZOOM_AMPLITUDE * Math.sin(Math.PI * animationProgress);
        basemap.setCamera({
            center: { lat, lng },
            zoom: calcZoom
        });
    };
    return { scene, sceneAnchor: initialViewport };
}
class FlightsPage extends page_1.Page {
    initialize() {
        this.overlay = new threejs_overlay_view_1.default({
            lat: initialViewport.lat,
            lng: initialViewport.lng,
            altitude: initialViewport.altitude
        });
        initScene(this.overlay, this.basemap);
        this.mapOverlays.push(this.overlay);
    }
    start() {
        const { lat, lng, zoom, tilt, heading } = initialViewport;
        const map = this.basemap.getMapInstance();
        this.basemap.setCamera({
            center: { lat, lng },
            tilt,
            heading,
            zoom
        });
        sceneStartTimestamp = performance.now();
        this.overlay.update = update;
        this.overlay.requestRedraw();
        this.overlay.getScene().visible = true;
        plane?.scale.setScalar(getPlaneScale(map.getZoom()));
        zoomListener = google.maps.event.addListener(map, 'zoom_changed', () => {
            plane?.scale.setScalar(getPlaneScale(map.getZoom()));
        });
    }
    stop() {
        this.overlay.update = null;
        this.overlay.getScene().visible = false;
        if (zoomListener)
            google.maps.event.removeListener(zoomListener);
    }
}
exports.FlightsPage = FlightsPage;
