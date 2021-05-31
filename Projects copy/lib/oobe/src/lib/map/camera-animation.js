"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearAnimation = exports.OrbitAnimation = exports.CameraAnimation = void 0;
const three_1 = require("three");
class CameraAnimation {
    constructor(basemap) {
        this.rafId = 0;
        this.lastFrameTime = 0;
        this.animationTime = 0;
        this.isPlaying = false;
        this.frameCallback = (t) => {
            this.animationTime += t - this.lastFrameTime;
            this.update(this.animationTime);
            this.lastFrameTime = t;
            if (this.isPlaying) {
                this.rafId = requestAnimationFrame(this.frameCallback);
            }
        };
        this.basemap = basemap;
    }
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
}
exports.CameraAnimation = CameraAnimation;
class OrbitAnimation extends CameraAnimation {
    constructor() {
        super(...arguments);
        this.degreesPerSecond = 0;
        this.initialHeading = 0;
    }
    update(animationTime) {
        this.basemap.setCamera({
            heading: this.initialHeading + (animationTime / 1000) * this.degreesPerSecond
        });
    }
}
exports.OrbitAnimation = OrbitAnimation;
class LinearAnimation extends CameraAnimation {
    constructor() {
        super(...arguments);
        this.duration = 0;
        this.from = null;
        this.to = null;
        this.easing = t => t;
    }
    update(animationTime) {
        const { from, to } = this;
        if (!from || !to) {
            console.warn(`LinearAnimation.update(): start and/or end-position missing.`);
            return;
        }
        const progress = this.easing(three_1.MathUtils.clamp(animationTime / this.duration, 0, 1));
        const newCamera = {};
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
exports.LinearAnimation = LinearAnimation;
function lerp(a, b, t) {
    return a + t * (b - a);
}
