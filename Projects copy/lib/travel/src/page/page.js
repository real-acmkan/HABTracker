"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
class Page {
    constructor(rootEl, basemap, placesService) {
        this.mapOverlays = [];
        this.isInitialized = false;
        this.rootEl = rootEl;
        this.basemap = basemap;
        this.placesService = placesService;
    }
    initialize() { }
    stop() { }
    start() { }
    show() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.initialize();
        }
        for (let overlay of this.mapOverlays) {
            overlay.setMap(this.basemap.getMapInstance());
        }
        this.rootEl.style.display = '';
    }
    hide() {
        this.rootEl.style.display = 'none';
        for (let overlay of this.mapOverlays) {
            overlay.setMap(null);
        }
    }
}
exports.Page = Page;
