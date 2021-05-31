"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latLngToMetersRelative = void 0;
const three_1 = require("three");
const distance_1 = require("@turf/distance");
const destination_1 = require("@turf/destination");
const projectionMatrixInverse = new three_1.Matrix4();
const raycaster = new three_1.Raycaster();
const defaultRaycasterParams = raycaster.params;
/**
 * A wrapper for google.maps.WebglOverlayView handling the details of the
 * integration with three.js.
 */
class ThreeJSOverlayView {
    /**
     *
     * @param sceneAnchor
     */
    constructor(sceneAnchor) {
        this.viewportSize = new three_1.Vector2();
        /**
         * This callback is called when the overlay has been added to the map, but
         * before it is first rendered.
         */
        this.onAdd = null;
        /**
         * This callback is called after the overlay has been removed from the map.
         */
        this.onRemove = null;
        /**
         * This callback is called for every frame being rendered.
         */
        this.update = null;
        // setup this class as proxy for the webgl-overlay
        this.overlay_ = new google.maps.WebglOverlayView();
        this.overlay_.onAdd = wrapExceptionLogger(this.onAdd_.bind(this));
        this.overlay_.onRemove = wrapExceptionLogger(this.onRemove_.bind(this));
        this.overlay_.onDraw = wrapExceptionLogger(this.onDraw_.bind(this));
        this.overlay_.onContextRestored = wrapExceptionLogger(this.onContextRestored_.bind(this));
        this.overlay_.onContextLost = wrapExceptionLogger(this.onContextLost_.bind(this));
        this.renderer_ = null;
        this.scene_ = new three_1.Scene();
        this.sceneAnchor_ = { altitude: 0, ...sceneAnchor };
        this.camera_ = new three_1.PerspectiveCamera();
        this.initScene();
    }
    /**
     * Runs raycasting for the specified screen-coordinate against the scene
     * or the optionally specified list of objects.
     * @param normalizedScreenPoint the screen-coordinates, x/y in range [-1, 1],
     *   y pointing up.
     * @param objects optional list of objects to consider, raycasts against the
     *   complete scene if none are specified
     * @param options.recursive set to true to also check children of the specified
     *   objects for intersections. Only applies when a list of objects is
     *   specified.
     * @param options.updateMatrix set this to false to skip updating the
     *   inverse-projection-matrix (useful if you need to run multiple
     *   raycasts for the same frame).
     * @param options.raycasterParameters parameters to pass on to the raycaster
     * @return returns the list of intersections
     */
    raycast(normalizedScreenPoint, objects = null, options = { updateMatrix: true, recursive: false }) {
        let { updateMatrix, recursive, raycasterParameters } = options;
        // the mvp-matrix used to render the previous frame is still stored in
        // this.camera_.projectionMatrix so we don't need to recompute it. That
        // matrix would transform meters in our world-space (relative to
        // this.sceneAnchor_) to clip-space/NDC coordinates. The inverse matrix
        // created here does the exact opposite and convert NDC-coordinates to
        // world-space
        if (updateMatrix) {
            projectionMatrixInverse.copy(this.camera_.projectionMatrix).invert();
        }
        // to construct the ray, we have to create two points from the mouse-position
        // with different depth. Applying the inverse projection-matrix converts
        // those points into world-space
        raycaster.ray.origin
            .set(normalizedScreenPoint.x, normalizedScreenPoint.y, 0)
            .applyMatrix4(projectionMatrixInverse);
        raycaster.ray.direction
            .set(normalizedScreenPoint.x, normalizedScreenPoint.y, 0.5)
            .applyMatrix4(projectionMatrixInverse)
            .sub(raycaster.ray.origin)
            .normalize();
        if (raycasterParameters) {
            raycaster.params = raycasterParameters;
        }
        if (objects === null) {
            objects = this.scene_;
            recursive = true;
        }
        const results = Array.isArray(objects)
            ? raycaster.intersectObjects(objects, recursive)
            : raycaster.intersectObject(objects, recursive);
        raycaster.params = defaultRaycasterParams;
        return results;
    }
    setMap(map) {
        this.overlay_.setMap(map);
    }
    getScene() {
        return this.scene_;
    }
    // proxy for the onAdd callback
    onAdd_() {
        if (this.onAdd) {
            this.onAdd();
        }
    }
    // proxy for the onRemove callback
    onRemove_() {
        if (this.onRemove) {
            this.onRemove();
        }
    }
    onContextRestored_(gl) {
        const mapGlCanvas = gl.canvas;
        let renderer = new three_1.WebGL1Renderer({
            canvas: mapGlCanvas,
            context: gl,
            ...gl.getContextAttributes()
        });
        renderer.autoClear = false;
        renderer.autoClearDepth = false;
        const { width, height } = gl.canvas;
        this.viewportSize.set(width, height);
        this.renderer_ = renderer;
    }
    onContextLost_() {
        if (!this.renderer_) {
            return;
        }
        this.viewportSize.set(0, 0);
        this.renderer_.dispose();
        this.renderer_ = null;
    }
    onDraw_(gl, transformer) {
        if (!this.scene_ || !this.renderer_) {
            return;
        }
        // fix: this appears to be a bug in the maps-API. onDraw will
        //   continue to be called by the api after it has been removed
        //   from the map. We should be able to remove this once fixed upstream
        if (this.overlay_.getMap() === null) {
            return;
        }
        const { lat, lng, altitude } = this.sceneAnchor_;
        this.camera_.projectionMatrix.fromArray(transformer.fromLatLngAltitude(new google.maps.LatLng({ lat, lng }), altitude, [0, 0, 0], [1, 1, 1]));
        const { width, height } = gl.canvas;
        this.viewportSize.set(width, height);
        this.renderer_.setViewport(0, 0, width, height);
        if (this.update) {
            const res = this.update(this.scene_, this.camera_);
            if (typeof res === 'undefined' || res)
                this.overlay_.requestRedraw();
        }
        this.renderer_.render(this.scene_, this.camera_);
        this.renderer_.resetState();
    }
    getViewportSize() {
        return this.viewportSize;
    }
    requestRedraw() {
        this.overlay_.requestRedraw();
    }
    latLngAltToVector2(point, target = new three_1.Vector2()) {
        const [dx, dy] = latLngToMetersRelative(point, this.sceneAnchor_);
        return target.set(dx, -dy);
    }
    latLngAltToVector3(point, target = new three_1.Vector3()) {
        const [dx, dy] = latLngToMetersRelative(point, this.sceneAnchor_);
        const { altitude = 0 } = point;
        return target.set(dx, altitude, -dy);
    }
    vector3ToLatLngAlt(point) {
        const distance = point.length();
        const bearing = getNorthBasedBearing(point);
        const target = destination_1.default([this.sceneAnchor_.lng, this.sceneAnchor_.lat], distance, bearing, {
            units: 'meters'
        });
        const coords = target.geometry.coordinates;
        return {
            lat: coords[1],
            lng: coords[0],
            altitude: point.y
        };
    }
    initScene() {
        this.scene_ = new three_1.Scene();
        // rotate the scene so it keeps the y-up orientation used by three.js
        this.scene_.rotation.x = Math.PI / 2;
        // create two three.js lights to illuminate the model (roughly approximates
        // the lighting of buildings in maps)
        const hemiLight = new three_1.HemisphereLight(0xffffff, 0x444444, 1);
        hemiLight.position.set(0, 1, -0.2).normalize();
        this.scene_.add(hemiLight);
        const dirLight = new three_1.DirectionalLight(0xffffff);
        dirLight.position.set(0, 100, 10);
        this.scene_.add(dirLight);
    }
}
exports.default = ThreeJSOverlayView;
function getNorthBasedBearing(point) {
    const bearingRad = Math.atan2(-point.z, point.x);
    const bearingDeg = (180 * bearingRad) / Math.PI;
    let bearingDegDisplacement = bearingDeg - 90;
    if (bearingDegDisplacement < -180)
        bearingDegDisplacement += 360;
    return -bearingDegDisplacement;
}
function latLngToMetersRelative(point, reference) {
    const dx = distance_1.default([reference.lng, reference.lat], [point.lng, reference.lat], { units: 'meters' });
    const sx = Math.sign(point.lng - reference.lng);
    const dy = distance_1.default([reference.lng, reference.lat], [reference.lng, point.lat], { units: 'meters' });
    const sy = Math.sign(point.lat - reference.lat);
    return [sx * dx, sy * dy];
}
exports.latLngToMetersRelative = latLngToMetersRelative;
// (hopefully) temporary solution to make sure exceptions
//   wont be silently ignored.
function wrapExceptionLogger(fn) {
    return ((...args) => {
        try {
            return fn(...args);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    });
}
