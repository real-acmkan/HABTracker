"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basemap = void 0;
const load_maps_api_1 = require("./load-maps-api");
const config_1 = require("../config");
const camera_animation_1 = require("../../../oobe/src/lib/map/camera-animation");
class Basemap {
    constructor(container, mapOptions) {
        this.map = null;
        this.camera = {};
        this.container = container;
        const mapsApiLoaded = load_maps_api_1.loadMapsApi({
            v: config_1.MAPS_API_VERSION,
            key: config_1.MAPS_API_KEY,
            map_ids: config_1.MAP_ID,
            libraries: 'places'
        });
        Object.assign(this.camera, mapOptions.initialViewport);
        this.mapReady = mapsApiLoaded.then(() => this.initMap());
    }
    getMapInstance() {
        if (!this.map) {
            throw new Error('Basemap.getMapInstance() called before map initialized.');
        }
        return this.map;
    }
    setCamera(camera) {
        Object.assign(this.camera, camera);
        if (this.map) {
            this.map.moveCamera(this.camera);
        }
    }
    animateOrbit(degreesPerSecond) {
        const animation = new camera_animation_1.OrbitAnimation(this);
        animation.initialHeading = this.map.getHeading();
        animation.degreesPerSecond = degreesPerSecond;
        animation.play();
        return animation;
    }
    animateToLinear(target, duration, easing = t => t) {
        const animation = new camera_animation_1.LinearAnimation(this);
        animation.from = { ...this.camera };
        animation.to = target;
        animation.duration = duration;
        animation.easing = easing;
        animation.play();
        return animation;
    }
    /**
     * Initializes the map in `this.container`.
     * @return A promise signaling when the map is fully loaded and initial tiles are rendered.
     */
    initMap() {
        const { zoom, center, heading, tilt } = this.camera;
        this.map = new google.maps.Map(this.container, {
            mapId: config_1.MAP_ID,
            disableDefaultUI: true,
            useStaticMap: true,
            backgroundColor: 'transparent',
            gestureHandling: 'greedy',
            zoom,
            center,
            heading,
            tilt
        });
        //@ts-ignore
        window.map = this.map;
    }
}
exports.Basemap = Basemap;
