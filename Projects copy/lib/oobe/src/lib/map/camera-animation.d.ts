interface BasemapCameraInterface {
    setCamera(camera: google.maps.Camera): void;
}
export declare abstract class CameraAnimation {
    private rafId;
    private lastFrameTime;
    private animationTime;
    private isPlaying;
    protected basemap: BasemapCameraInterface;
    constructor(basemap: BasemapCameraInterface);
    abstract update(animationTime: number): void;
    play(): void;
    pause(): void;
    resume(): void;
    dispose(): void;
    private frameCallback;
}
export declare class OrbitAnimation extends CameraAnimation {
    degreesPerSecond: number;
    initialHeading: number;
    update(animationTime: number): void;
}
export declare class LinearAnimation extends CameraAnimation {
    duration: number;
    from: google.maps.Camera | null;
    to: google.maps.Camera | null;
    easing: (t: number) => number;
    update(animationTime: number): void;
}
export {};
