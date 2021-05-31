"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SightsPage = void 0;
const page_1 = require("./page");
const create_sights_content_1 = require("../lib/create-sights-content");
const threejs_overlay_view_1 = require("../../../oobe/src/lib/map/threejs-overlay-view");
const sights_marker_1 = require("../lib/sights-marker");
const dotted_directions_line_1 = require("../lib/dotted-directions-line");
const origin_marker_1 = require("../lib/origin-marker");
const icon_marker_3d_1 = require("../../../oobe/src/lib/three/icon-marker-3d");
const sights_places_json_1 = require("../../public/data/sights-places.json");
const accomodation_marker_purple_svg_1 = require("url:../../public/images/accomodation-marker-purple.svg");
const easings_1 = require("../lib/easings");
const THEME_COLOR = 0x590ed1;
const INITIAL_CAMERA = {
    center: { lat: 51.499566, lng: -0.122858 },
    heading: 70,
    tilt: 67,
    zoom: 17.4
};
const ANIMATION_START_CAMERA = {
    center: {
        lat: 51.50235459595671,
        lng: -0.12898104249663866
    },
    zoom: 15.5,
    heading: 52.66666666666657,
    tilt: 25
};
const ANIMATION_END_CAMERA = {
    center: {
        lat: 51.49970749364103,
        lng: -0.12768149076912927
    },
    zoom: 17.6,
    heading: 112.99999999999994,
    tilt: 67.5
};
const ANCHOR_POSITION = { lat: 51.5010794, lng: -0.1248092 };
const ORIGIN_LOCATION = { lat: 51.5016527, lng: -0.1298745 };
// tried using the attractions themselves as waypoints, but that didn't
// look right, so here's the manually curated waypoints for a nice roundtrip
// (up to 10 are allowed in the regular pricing-bracket)
const DIRECTIONS_WAYPOINTS = [
    { lat: 51.4995167, lng: -0.1288148 },
    { lat: 51.5002555, lng: -0.1259773 },
    { lat: 51.5010535, lng: -0.1245272 },
    { lat: 51.5032943, lng: -0.1193766 },
    { lat: 51.5068041, lng: -0.1233415 },
    { lat: 51.5025741, lng: -0.1354728 },
    { lat: 51.5010248, lng: -0.1406709 }
];
const END_LOCATION = { lat: 51.5071821, lng: -0.1417641 };
const ACCOMODATION_MARKER_LOCATION = { lat: 51.5071821, lng: -0.1417641 };
/**
 * Shows a couple of landmarks in london loaded from the places-API along
 * with a walking-directions line connecting all of them and back to the
 * hotel.
 */
class SightsPage extends page_1.Page {
    constructor() {
        super(...arguments);
        this.overlay = null;
        this.attractions = [];
        this.markers = [];
        this.mapAnimation = null;
        this.introAnimationTimer = 0;
    }
    async initialize() {
        const overlay = new threejs_overlay_view_1.default(ANCHOR_POSITION);
        this.overlay = overlay;
        this.overlay.update = () => this.update();
        this.mapOverlays.push(overlay);
        this.directionsService = new google.maps.DirectionsService();
        this.attractions = await loadAttractions(this.placesService);
        create_sights_content_1.createSightsContent(this.attractions, this.basemap, INITIAL_CAMERA);
        const sceneInitialized = this.initScene();
        const directionsLoaded = this.loadDirections(ORIGIN_LOCATION, END_LOCATION);
        Promise.all([sceneInitialized, directionsLoaded]).then(() => overlay.requestRedraw());
    }
    start() {
        this.basemap.setCamera(ANIMATION_START_CAMERA);
        this.introAnimationTimer = window.setTimeout(() => {
            this.mapAnimation = this.basemap.animateToLinear(ANIMATION_END_CAMERA, 3000, easings_1.easeInOutCubic);
        }, 1000);
    }
    update() {
        if (this.markers.length === 0)
            return;
        const overlay = this.overlay;
        const map = this.basemap.getMapInstance();
        const markerProps = {
            heading: map.getHeading(),
            tilt: map.getTilt(),
            zoom: map.getZoom()
        };
        this.originMarker.update(markerProps);
        this.accomodationMarker.update(markerProps);
        const updateComplete = this.markers.every(marker => marker.update(markerProps));
        if (!updateComplete) {
            overlay.requestRedraw();
        }
    }
    stop() {
        clearTimeout(this.introAnimationTimer);
        if (this.mapAnimation) {
            this.mapAnimation.dispose();
            this.mapAnimation = null;
        }
    }
    /**
     * Sets up the scene with all the markers for current position,
     * attractions and accomodation.
     */
    async initScene() {
        const overlay = this.overlay;
        const scene = overlay.getScene();
        this.originMarker = new origin_marker_1.default({
            color: THEME_COLOR,
            size: 30,
            baseZoom: INITIAL_CAMERA.zoom
        });
        overlay.latLngAltToVector3(ORIGIN_LOCATION, this.originMarker.position);
        scene.add(this.originMarker);
        this.accomodationMarker = new icon_marker_3d_1.default({
            iconSrc: accomodation_marker_purple_svg_1.default,
            iconSize: 42,
            color: THEME_COLOR,
            labelHeight: 40
        });
        overlay.latLngAltToVector3(ACCOMODATION_MARKER_LOCATION, this.accomodationMarker.position);
        scene.add(this.accomodationMarker);
        for (let attraction of this.attractions) {
            this.markers.push(this.createMarker(attraction));
        }
        scene.add(...this.markers);
    }
    /**
     * Creates an attractions-marker for the given attraction.
     */
    createMarker(attraction) {
        const name = attraction.place.name.replace('lastminute.com', '');
        const marker = new sights_marker_1.default({
            label: name,
            width: 120,
            altitude: attraction.coordinates.altitude,
            baseZoom: INITIAL_CAMERA.zoom
        });
        this.overlay.latLngAltToVector3({
            lat: attraction.coordinates.lat,
            lng: attraction.coordinates.lng
        }, marker.position);
        return marker;
    }
    /**
     * Loads the routing along the waypoints specified above and adds the
     * resulting polyline to the scene.
     */
    async loadDirections(startPoint, endPoint) {
        const overlay = this.overlay;
        const result = await this.directionsService.route({
            origin: startPoint,
            destination: endPoint,
            waypoints: DIRECTIONS_WAYPOINTS.map(ll => ({
                location: new google.maps.LatLng(ll),
                stopover: true
            })),
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.WALKING
        });
        if (result === null || result.routes.length === 0) {
            console.warn('no routing result!');
            return;
        }
        const route = result.routes[0].overview_path;
        const directionsLine = new dotted_directions_line_1.default(route.map(ll => overlay.latLngAltToVector2(ll.toJSON())), { color: THEME_COLOR, opacity: 1, pointSize: 5, pointSpacing: 10 });
        overlay.getScene().add(directionsLine);
    }
}
exports.SightsPage = SightsPage;
// make sure to only load details once
let attractionsPromise = null;
/**
 * Load details from the places-API.
 */
async function loadAttractions(placesService) {
    if (attractionsPromise === null) {
        attractionsPromise = Promise.all(sights_places_json_1.default.map(({ place_id: placeId, coordinates }) => placesGetDetailsAsync(placesService, placeId, coordinates)));
    }
    return attractionsPromise;
}
/**
 * Async wrapper for PlacesService.getDetails.
 */
function placesGetDetailsAsync(service, placeId, coordinates) {
    const request = {
        placeId: placeId,
        fields: [
            'name',
            'rating',
            'user_ratings_total',
            'formatted_address',
            'photos',
            'geometry'
        ]
    };
    return new Promise((resolve, reject) => {
        service.getDetails(request, (place, status) => {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                reject(new Error('places api error'));
                return;
            }
            if (!place) {
                reject(new Error('places api returned no result'));
                return;
            }
            resolve({ place, coordinates });
        });
    });
}
