"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const basemap_1 = require("./basemap");
const config_1 = require("../config");
class App {
    constructor() {
        this.pageTypes = new Map();
        this.pages = new Map();
        this.currentPageId = null;
        this.currentPage = null;
        this.basemap = new basemap_1.Basemap(document.querySelector('.map-container'), { initialViewport: config_1.INITIAL_VIEWPORT });
        // forward map-initialization promise
        this.ready = this.basemap.mapReady;
        this.ready.then(() => {
            this.placesService = new google.maps.places.PlacesService(this.basemap.getMapInstance());
        });
    }
    registerPage(pageId, page) {
        this.pageTypes.set(pageId, page);
    }
    update(state) {
        this.setCurrentPage(state.currentPage);
    }
    setCurrentPage(pageId) {
        if (!this.pageTypes.has(pageId)) {
            console.error(`setCurrentPage(): invalid pageId "${pageId}"`);
            return;
        }
        if (pageId === this.currentPageId) {
            return;
        }
        if (this.currentPage !== null) {
            this.currentPage.stop();
            this.currentPage.hide();
        }
        this.currentPage = this.getPage(pageId);
        this.currentPageId = pageId;
        this.currentPage.show();
        this.currentPage.start();
    }
    /**
     * Gets an existing page-instance or creates it when retrieved for the first time
     * @param pageId
     * @private
     */
    getPage(pageId) {
        if (!this.pages.has(pageId)) {
            const PageCtor = this.pageTypes.get(pageId);
            const pageEl = document.querySelector(`#${pageId}`);
            if (!pageEl) {
                throw new Error(`App.setCurrentPage(): failed to find element using selector #${pageId}`);
            }
            this.pages.set(pageId, new PageCtor(pageEl, this.basemap, this.placesService));
        }
        // can't be null/undefined at this point
        return this.pages.get(pageId);
    }
}
exports.App = App;
