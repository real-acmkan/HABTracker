import {MathUtils} from 'three';

// extracted from basemap to limit the access for animations
interface BasemapCameraInterface {
  setCamera(camera: google.maps.Camera): void;
}

export abstract class CameraAnimation {
  private rafId: number = 0;
  private lastFrameTime: number = 0;
  private animationTime: number = 0;
  private isPlaying: boolean = false;
  protected basemap: BasemapCameraInterface;

  constructor(basemap: BasemapCameraInterface) {
    this.basemap = basemap;
  }

  abstract update(animationTime: number): void;

  play() {
    this.isPlaying = true;
    this.animationTime = 0;
    this.lastFrameTime = performance.now();

    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.frameCallback);
  }

  pause() {
    cancelAnimationFrame(this.rafId);
    this.isPlaying = false;
    this.rafId = 0;
  }

  resume() {
    this.isPlaying = true;
    this.lastFrameTime = performance.now();

    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.frameCallback);
  }

  dispose() {
    this.pause();
  }

  private frameCallback = (t: number) => {
    this.animationTime += t - this.lastFrameTime;

    this.update(this.animationTime);

    this.lastFrameTime = t;

    if (this.isPlaying) {
      this.rafId = requestAnimationFrame(this.frameCallback);
    }
  };
}

export class OrbitAnimation extends CameraAnimation {
  public degreesPerSecond: number = 0;
  public initialHeading: number = 0;

  update(animationTime: number): void {
    this.basemap.setCamera({
      heading:
        this.initialHeading + (animationTime / 1000) * this.degreesPerSecond
    });
  }
}

export class LinearAnimation extends CameraAnimation {
  public duration: number = 0;
  public from: google.maps.Camera | null = null;
  public to: google.maps.Camera | null = null;
  public easing: (t: number) => number = t => t;

  update(animationTime: number): void {
    const {from, to} = this;

    if (!from || !to) {
      console.warn(
        `LinearAnimation.update(): start and/or end-position missing.`
      );
      return;
    }

    const progress = this.easing(
      MathUtils.clamp(animationTime / this.duration, 0, 1)
    );
    const newCamera: google.maps.Camera = {};

    if (from.heading !== undefined && to.heading !== undefined) {
      const delta = to.heading - from.heading;
      let targetHeading = to.heading;
      if (Math.abs(delta) > 180) {
        targetHeading -= 360 * Math.sign(delta);
      }
      newCamera.heading = lerp(from.heading, targetHeading, progress);
    }

    if (from.tilt !== undefined && to.tilt !== undefined) {
      newCamera.tilt = lerp(from.tilt, to.tilt, progress);
    }

    if (from.zoom !== undefined && to.zoom !== undefined) {
      newCamera.zoom = lerp(from.zoom, to.zoom, progress);
    }

    if (from.center && to.center) {
      const c0 = from.center;
      const c1 = to.center;

      const lat0 = typeof c0.lat === 'number' ? c0.lat : c0.lat();
      const lng0 = typeof c0.lng === 'number' ? c0.lng : c0.lng();
      const lat1 = typeof c1.lat === 'number' ? c1.lat : c1.lat();
      const lng1 = typeof c1.lng === 'number' ? c1.lng : c1.lng();

      newCamera.center = {
        lat: lerp(lat0, lat1, progress),
        lng: lerp(lng0, lng1, progress)
      };
    }

    this.basemap.setCamera(newCamera);

    if (progress === 1) {
      this.pause();
    }
  }
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}
