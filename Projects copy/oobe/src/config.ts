export const MAPS_API_KEY = 'AIzaSyDDjqkZFFBlxBBeaHJKX5spNHtpItuXiwY';
export const MAPS_API_VERSION = 'beta';

let mapIds: {[name: string]: string} = {
  default: 'dd811470737ed2c6',
  nolabel: '4a78ffaf070ad08b',
  minimal: '7d3ccc765a8b2fe4'
};

const mapType = new URLSearchParams(location.search).get('mapType') || '';
export const MAP_ID = mapIds[mapType] || mapIds.default;

export const INITIAL_VIEWPORT: google.maps.Camera = {
  center: {lat: 53.554486, lng: 10.007479},
  zoom: 19,
  heading: 324,
  tilt: 65
};

export const PAGES = Object.fromEntries(
  Array.from(document.querySelectorAll('.page')).map(el => {
    return [el.id, el];
  })
);
export const PAGE_IDS = Object.keys(PAGES);
export const NUM_PAGES = PAGE_IDS.length;
