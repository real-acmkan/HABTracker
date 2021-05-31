"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntroPage = void 0;
const page_1 = require("./page");
const initialCamera = {
    center: {
        lat: 51.499428273857845,
        lng: -0.12295298950419031
    },
    heading: 0,
    tilt: 60,
    zoom: 17
};
function tilesLoaded(map, timeout = 1500) {
    return new Promise(resolve => {
        const listener = map.addListener('tilesloaded', () => {
            listener.remove();
            resolve();
        });
        // just in case: make sure the loading-state doesn't stay for
        // more than 4 seconds
        setTimeout(() => {
            listener.remove();
            resolve();
        }, timeout);
    });
}
class IntroPage extends page_1.Page {
    constructor() {
        super(...arguments);
        this.animation = null;
        this.pagesContainer = (document.querySelector('.pages'));
        this.navigation = (document.querySelector('.navigation'));
    }
    initialize() {
        document.body.classList.add('is-loading');
        this.basemap.mapReady.then(async () => {
            await tilesLoaded(this.basemap.getMapInstance());
            document.body.classList.remove('is-loading');
        });
        this.pagesContainer.style.display = 'none';
        this.navigation.style.display = 'none';
    }
    start() {
        this.basemap.setCamera(initialCamera);
        this.animation = this.basemap.animateOrbit(1);
        this.navigation.style.display = 'none';
        this.pagesContainer.style.display = 'none';
    }
    stop() {
        this.animation.dispose();
        this.animation = null;
    }
    hide() {
        super.hide();
        this.pagesContainer.style.display = '';
        this.navigation.style.display = '';
    }
}
exports.IntroPage = IntroPage;
