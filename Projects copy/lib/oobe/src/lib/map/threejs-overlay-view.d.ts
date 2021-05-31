/// <reference types="google.maps" />
import { Camera, Intersection, Object3D, PerspectiveCamera, RaycasterParameters, Scene, Vector2, Vector3, WebGL1Renderer } from 'three';
import type { LatLngAltitudeLiteral } from '../types';
declare type UpdateFunction = (scene: Scene, camera: Camera) => boolean | void;
export interface RaycastOptions {
    recursive?: boolean;
    raycasterParameters?: RaycasterParameters;
    updateMatrix?: boolean;
}
/**
 * A wrapper for google.maps.WebglOverlayView handling the details of the
 * integration with three.js.
 */
export default class ThreeJSOverlayView {
    /**
     * The WebglOverlayView instance being used. Aggregation is used instead
     * of extending the class to allow for this class to be parsed before the
     * google-maps API has been loaded.
     * @protected
     */
    protected readonly overlay_: google.maps.WebglOverlayView;
    /**
     * The three.js camera-instance. When interacting with this camera it is
     * important to know that the world-matrix doesn't contain any useful
     * information. Position and orientation of the camera are instead part
     * of the projectionMatrix.
     * @protected
     */
    protected readonly camera_: PerspectiveCamera;
    /**
     * The three.js renderer instance. This is initialized in the
     * onContextRestored-callback.
     * @protected
     */
    protected renderer_: WebGL1Renderer | null;
    /**
     * The three.js Scene instance.
     * @protected
     */
    protected scene_: Scene;
    /**
     * The geographic reference-point in latitude/longitude/altitude above ground.
     * @protected
     */
    protected sceneAnchor_: LatLngAltitudeLiteral;
    protected viewportSize: Vector2;
    /**
     * This callback is called when the overlay has been added to the map, but
     * before it is first rendered.
     */
    onAdd: (() => void) | null;
    /**
     * This callback is called after the overlay has been removed from the map.
     */
    onRemove: (() => void) | null;
    /**
     * This callback is called for every frame being rendered.
     */
    update: UpdateFunction | null;
    /**
     *
     * @param sceneAnchor
     */
    constructor(sceneAnchor: LatLngAltitudeLiteral | google.maps.LatLngLiteral);
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
    raycast(normalizedScreenPoint: Vector2, objects?: Object3D | Object3D[] | null, options?: RaycastOptions): Intersection[];
    setMap(map: google.maps.Map): void;
    getScene(): Scene;
    onAdd_(): void;
    onRemove_(): void;
    onContextRestored_(gl: WebGLRenderingContext): void;
    onContextLost_(): void;
    onDraw_(gl: WebGLRenderingContext, transformer: google.maps.CoordinateTransformer): void;
    getViewportSize(): Vector2;
    requestRedraw(): void;
    latLngAltToVector2(point: LatLngAltitudeLiteral | google.maps.LatLngLiteral, target?: Vector2): Vector2;
    latLngAltToVector3(point: LatLngAltitudeLiteral | google.maps.LatLngLiteral, target?: Vector3): Vector3;
    vector3ToLatLngAlt(point: Vector3): LatLngAltitudeLiteral;
    private initScene;
}
export declare function latLngToMetersRelative(point: google.maps.LatLngLiteral, reference: LatLngAltitudeLiteral): number[];
export {};
