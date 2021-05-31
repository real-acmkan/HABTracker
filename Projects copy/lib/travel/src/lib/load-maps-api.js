"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMapsApi = void 0;
let mapsApiLoaded = null;
async function loadMapsApi(apiOptions) {
    if (mapsApiLoaded !== null) {
        return mapsApiLoaded;
    }
    const apiUrl = new URL('https://maps.googleapis.com/maps/api/js');
    for (let [key, value] of Object.entries(apiOptions)) {
        apiUrl.searchParams.set(key, value);
    }
    apiUrl.searchParams.set('callback', '__maps_callback__');
    mapsApiLoaded = new Promise(resolve => {
        window.__maps_callback__ = () => {
            delete window.__maps_callback__;
            resolve();
        };
        const script = document.createElement('script');
        script.src = apiUrl.toString();
        document.body.appendChild(script);
    });
    return mapsApiLoaded;
}
exports.loadMapsApi = loadMapsApi;
