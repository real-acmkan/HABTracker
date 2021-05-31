/// <reference types="google.maps" />
import { CameraAnimation } from '../../../oobe/src/lib/map/camera-animation';
export interface MapOverlayInterface {
    setMap(map: google.maps.Map | null): void;
}
export interface BasemapOptions {
    initialViewport: google.maps.Camera;
}
export declare class Basemap {
    readonly mapReady: Promise<void>;
    private readonly container;
    private map;
    private camera;
    constructor(container: Element, mapOptions: BasemapOptions);
    getMapInstance(): google.maps.Map;
    setCamera(camera: google.maps.Camera): void;
    animateOrbit(degreesPerSecond: number): CameraAnimation;
    animateToLinear(target: google.maps.Camera, duration: number, easing?: (t: number) => number): CameraAnimation;
    /**
     * Initializes the map in `this.container`.
     * @return A promise signaling when the map is fully loaded and initial tiles are rendered.
     */
    private initMap;
}
