"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUM_PAGES = exports.PAGE_IDS = exports.PAGES = exports.INITIAL_VIEWPORT = exports.MAP_ID = exports.MAPS_API_VERSION = exports.MAPS_API_KEY = void 0;
exports.MAPS_API_KEY = 'AIzaSyDDjqkZFFBlxBBeaHJKX5spNHtpItuXiwY';
exports.MAPS_API_VERSION = 'beta';
let mapIds = {
    default: 'f28b6222c347fbc9',
    nolabel: '4a78ffaf070ad08b',
    minimal: '7d3ccc765a8b2fe4'
};
const mapType = new URLSearchParams(location.search).get('mapType') || '';
exports.MAP_ID = mapIds[mapType] || mapIds.default;
exports.INITIAL_VIEWPORT = {
    center: { lat: 53.554486, lng: 10.007479 },
    zoom: 19,
    heading: 324,
    tilt: 65
};
exports.PAGES = Object.fromEntries(Array.from(document.querySelectorAll('.page')).map(el => {
    return [el.id, el];
}));
exports.PAGE_IDS = Object.keys(exports.PAGES);
exports.NUM_PAGES = exports.PAGE_IDS.length;
