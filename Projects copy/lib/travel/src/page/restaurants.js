"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantsPage = void 0;
const three_1 = require("three");
const dotted_directions_line_1 = require("../lib/dotted-directions-line");
const page_1 = require("./page");
const easings_1 = require("../lib/easings");
const add_places_image_credits_1 = require("../lib/add-places-image-credits");
const restaurants_icon_svg_1 = require("url:../../public/images/restaurants-icon.svg");
const restaurants_icon_inverted_svg_1 = require("url:../../public/images/restaurants-icon-inverted.svg");
const restaurants_icon_hover_svg_1 = require("url:../../public/images/restaurants-icon-hover.svg");
const origin_marker_1 = require("../lib/origin-marker");
const threejs_overlay_view_1 = require("../../../oobe/src/lib/map/threejs-overlay-view");
const icon_marker_3d_1 = require("../../../oobe/src/lib/three/icon-marker-3d");
const animationStartCamera = {
    center: {
        lat: 51.506623909832456,
        lng: -0.14201179154832877
    },
    zoom: 17,
    heading: 0,
    tilt: 0
};
const defaultCamera = {
    center: { lat: 51.50663929607001, lng: -0.14198304637023096 },
    heading: 41,
    tilt: 67.5,
    zoom: 17
};
// doesn't seem possible to get this from the map-instance otherwise
const DEFAULT_DRAGGABLE_CURSOR = 'url("https://maps.gstatic.com/mapfiles/openhand_8_8.cur"), default';
const PERSON_POSITION = {
    lat: 51.50693850015297,
    lng: -0.1423229107977919,
    altitude: 0
};
const MARKER_DEFAULT_STYLE = {
    iconSrc: restaurants_icon_svg_1.default,
    color: 0xdb4437,
    iconSize: 30,
    baseZoom: defaultCamera.zoom,
    labelHeight: 60
};
const ANIMATION_DURATION = 1500;
const ANIMATION_DELAY = 300;
class RestaurantsPage extends page_1.Page {
    constructor() {
        super(...arguments);
        this.directionsService = null;
        this.mapListeners = [];
        this.markerContainer = new three_1.Group();
        this.restaurantMarkers = [];
        this.markersToAdd = [];
        this.highlightedMarker = null;
        this.selectedMarker = null;
        this.startTime = 0;
        this.mousePosition = new three_1.Vector2();
        this.mapAnimation = null;
        this.delayedAnimationId = 0;
    }
    initialize() {
        const overlay = new threejs_overlay_view_1.default(defaultCamera.center);
        overlay.update = () => this.update();
        this.overlay = overlay;
        this.mapOverlays.push(overlay);
        icon_marker_3d_1.default.prefetchIcons(restaurants_icon_svg_1.default, restaurants_icon_hover_svg_1.default, restaurants_icon_inverted_svg_1.default);
        this.initScene().then(() => overlay.requestRedraw());
        this.directionsService = new google.maps.DirectionsService();
    }
    start() {
        this.bindMapEvents();
        this.startTime = performance.now();
        this.basemap.setCamera(animationStartCamera);
        this.delayedAnimationId = window.setTimeout(() => {
            this.delayedAnimationId = 0;
            this.mapAnimation = this.basemap.animateToLinear(defaultCamera, ANIMATION_DURATION, easings_1.easeInOutQuint);
        }, ANIMATION_DELAY);
    }
    update() {
        this.updateRaycaster();
        // to get the cursor:pointer when hovering over markers, we need to trick
        // maps into using a different cursor for the draggable state we're in.
        // @ts-ignore this is broken and doesn't find correct typings for MapOptions
        this.basemap.getMapInstance().setOptions({
            draggableCursor: this.highlightedMarker
                ? 'pointer'
                : DEFAULT_DRAGGABLE_CURSOR
        });
        const map = this.basemap.getMapInstance();
        const zoom = map.getZoom() || defaultCamera.zoom;
        const heading = map.getHeading() || 0;
        const tilt = map.getTilt() || 0;
        let needsRedraw = false;
        // staggered adding of markers – randomly add markers starting after
        // 2 seconds until all markers have been added.
        if (this.markersToAdd.length > 0) {
            needsRedraw = true;
            if (performance.now() - this.startTime > 1000 && Math.random() > 0.6) {
                let randomMarker = this.markersToAdd.splice(three_1.MathUtils.randInt(0, this.markersToAdd.length - 1), 1);
                this.markerContainer.add(...randomMarker);
            }
        }
        // update origin-marker
        if (this.originMarker) {
            this.originMarker.update({ heading, tilt, zoom });
        }
        // update marker-styles based on selected/highlighted markers
        for (const marker of this.restaurantMarkers) {
            let markerProps = { ...MARKER_DEFAULT_STYLE, zoom, heading, tilt };
            if (marker.userData.isSelected) {
                markerProps.color = 0xdb4437;
                markerProps.iconSrc = restaurants_icon_inverted_svg_1.default;
                markerProps.labelHeight *= 1.3;
                markerProps.iconSize *= 1.2;
            }
            else if (marker.userData.isHighlighted) {
                markerProps.color = 0xa4332a;
                markerProps.iconSrc = restaurants_icon_hover_svg_1.default;
            }
            marker.update(markerProps);
            // make the walking-directions visible if already loaded
            if (marker.userData.directionsLine) {
                marker.userData.directionsLine.visible = marker.userData.isSelected;
            }
        }
        return needsRedraw;
    }
    stop() {
        this.unbindMapEvents();
        this.markersToAdd = [...this.restaurantMarkers];
        this.markerContainer.children = [];
        if (this.mapAnimation) {
            this.mapAnimation.dispose();
            this.mapAnimation = null;
        }
        if (this.delayedAnimationId) {
            clearTimeout(this.delayedAnimationId);
            this.delayedAnimationId = 0;
        }
        // if there's a marker selected, make sure it will be the first one shown
        // when navigating back to the page.
        if (this.selectedMarker) {
            const selectedMarkerIdx = this.markersToAdd.indexOf(this.selectedMarker);
            this.markersToAdd.splice(selectedMarkerIdx, 1);
            this.markerContainer.add(this.selectedMarker);
        }
    }
    /**
     * Sets up the scene.
     * @return promise that resolves when everything is complete and added
     *   to the scene.
     */
    async initScene() {
        const overlay = this.overlay;
        const scene = overlay.getScene();
        this.originMarker = new origin_marker_1.default({
            size: 40,
            color: MARKER_DEFAULT_STYLE.color
        });
        overlay.latLngAltToVector3(PERSON_POSITION, this.originMarker.position);
        this.originMarker.position.y = 0.2;
        scene.add(this.originMarker);
        scene.add(this.markerContainer);
        await this.initRestaurantMarkers();
    }
    /**
     * Loads nearby restaurants from the places-API and creates 3d-icon markers
     * for them.
     */
    async initRestaurantMarkers() {
        const overlay = this.overlay;
        const restaurants = await queryRestaurants(this.placesService, defaultCamera.center, 1000);
        const referencePoint = overlay.latLngAltToVector3({
            ...PERSON_POSITION,
            altitude: 0
        });
        let closestMarker = null;
        let minDist = Infinity;
        for (let restaurant of restaurants) {
            const marker = new icon_marker_3d_1.default({
                iconSrc: restaurants_icon_svg_1.default,
                iconSize: 35,
                baseZoom: defaultCamera.zoom,
                labelHeight: 60
            });
            overlay.latLngAltToVector3({ ...restaurant.location, altitude: 0 }, marker.position);
            const dist = marker.position.distanceTo(referencePoint);
            if (dist < minDist) {
                closestMarker = marker;
                minDist = dist;
            }
            marker.userData.restaurant = restaurant;
            this.restaurantMarkers.push(marker);
            this.markersToAdd.push(marker);
        }
        if (closestMarker) {
            this.setSelectedMarker(closestMarker);
            this.markersToAdd.splice(this.markersToAdd.indexOf(closestMarker), 1);
            this.markerContainer.add(closestMarker);
        }
    }
    /**
     * Updates the walking-directions for the specified marker via the
     * directions-API and creates a DottedDirectionsLine from the results.
     */
    async loadDirections(marker) {
        if (marker.userData.directionsLine) {
            return;
        }
        const overlay = this.overlay;
        const restaurant = marker.userData.restaurant;
        const result = await this.directionsService.route({
            origin: PERSON_POSITION,
            destination: restaurant.location,
            travelMode: google.maps.TravelMode.WALKING
        });
        if (result === null || result.routes.length === 0) {
            console.warn('no routing result!');
            return;
        }
        const route = result.routes[0].overview_path;
        const directionsLine = new dotted_directions_line_1.default(route.map(ll => overlay.latLngAltToVector2(ll.toJSON())), { color: 0xdb4437, opacity: 1, pointSize: 5, pointSpacing: 10 });
        directionsLine.visible = false;
        overlay.getScene().add(directionsLine);
        marker.userData.directionsLine = directionsLine;
    }
    /**
     * Registers event-handlers for the mousemove and click events.
     */
    bindMapEvents() {
        const overlay = this.overlay;
        const map = this.basemap.getMapInstance();
        const mapDiv = map.getDiv();
        const updateMousePosition = (ev) => {
            const domEvent = ev.domEvent;
            const mapRect = mapDiv.getBoundingClientRect();
            const x = domEvent.clientX - mapRect.left;
            const y = domEvent.clientY - mapRect.top;
            this.mousePosition.set((2 * x) / mapRect.width - 1, 1 - (2 * y) / mapRect.height);
        };
        const mousemoveListener = map.addListener('mousemove', (ev) => {
            updateMousePosition(ev);
            // we can't rely on a running update-loop for this demo.
            overlay.requestRedraw();
        });
        const clickListener = map.addListener('click', (ev) => {
            updateMousePosition(ev);
            this.updateRaycaster();
            if (this.highlightedMarker) {
                this.setSelectedMarker(this.highlightedMarker);
                overlay.requestRedraw();
            }
        });
        this.mapListeners = [mousemoveListener, clickListener];
    }
    /**
     * Unbinds all the event-handlers from bindMapEvents.
     * @private
     */
    unbindMapEvents() {
        this.mapListeners.forEach(listener => listener.remove());
        this.mapListeners = [];
    }
    /**
     * Updates the internal raycaster-state and sets/resets the
     * highlighting-state.
     */
    updateRaycaster() {
        const intersections = this.overlay.raycast(this.mousePosition);
        // something under the cursor?
        if (intersections.length === 0) {
            if (this.highlightedMarker) {
                this.highlightedMarker.userData.isHighlighted = false;
                this.highlightedMarker = null;
            }
            return;
        }
        const markerUnderCursor = getParentMarker(intersections[0].object);
        // nothing changed?
        if (markerUnderCursor === this.highlightedMarker) {
            return;
        }
        if (this.highlightedMarker) {
            this.highlightedMarker.userData.isHighlighted = false;
        }
        this.highlightedMarker = markerUnderCursor;
        if (markerUnderCursor) {
            markerUnderCursor.userData.isHighlighted = true;
        }
    }
    /**
     * Sets the specified marker as selected (restoring a previous selction if
     * there is one), updates the directions and the panel-content.
     */
    setSelectedMarker(marker) {
        if (this.selectedMarker) {
            this.selectedMarker.userData.isSelected = false;
        }
        this.selectedMarker = marker;
        this.selectedMarker.userData.isSelected = true;
        this.loadDirections(this.selectedMarker).then(() => {
            this.overlay?.requestRedraw();
        });
        updateRestaurantDetails(marker.userData.restaurant);
    }
}
exports.RestaurantsPage = RestaurantsPage;
// ---- utility and helper functions below
/**
 * Loads and filters restaurants in a radius around the current location.
 */
async function queryRestaurants(service, location, radius) {
    const { results, status } = await placesNearbySearchAsync(service, {
        location,
        radius,
        type: 'restaurant'
    });
    if (status !== 'OK') {
        console.warn('places request failed');
        return [];
    }
    if (results === null) {
        console.warn('no places results');
        return [];
    }
    return results.filter(isUsablePlaceResult).map(placeResultToRestaurant);
}
/**
 * Updates the html-content for the selected restaurant.
 * @param restaurant
 */
function updateRestaurantDetails(restaurant) {
    const { photo, name, rating, userRatingsTotal, vicinity, priceLevel } = restaurant;
    const rootEl = document.querySelector('#restaurants');
    const entities = (s) => s
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;');
    const numFormatter = new Intl.NumberFormat();
    // prettier-ignore
    rootEl.innerHTML = `
    <img src='${photo.url}' alt='${entities(name)}' class='restaurant-image' />
    <div class='restaurant-heading'>${entities(name)}</div>
    <div class='infobox-rating'>
      <div class='stars-container'>
        <span class='stars-text'>${rating}</span>

        ${[0, 1, 2, 3, 4].map(n => {
        if (rating > n + 0.75)
            return `<mwc-icon class='star-icon'>star</mwc-icon>`;
        return rating > n + 0.25
            ? `<mwc-icon class='star-icon'>star_half</mwc-icon>`
            : `<mwc-icon class='star-icon'>star_border</mwc-icon>`;
    }).join('\n')}
      </div>
      <p class='infobox-reviews'>${numFormatter.format(userRatingsTotal)} reviews</p>
      ${priceLevel ? `<div class='restaurant-price-container'>${'£'.repeat(priceLevel)}</div>` : ''}
    </div>
    <span class='restaurant-vicinity'>${entities(vicinity)}</span>
    
    <div class='additional-info-container'>
      <div class='additional-info-circle'></div>
      <div class='additional-info-line'></div>
      <div class='additional-info-circle'></div>
      <div class='additional-info-line'></div>
      <div class='additional-info-circle'></div>
      <div class='additional-info-line'></div>
    </div>
  `;
    add_places_image_credits_1.default(photo, rootEl);
}
/**
 * Async wrapper for PlacesService.nearbySearch().
 */
async function placesNearbySearchAsync(placesService, request) {
    return new Promise(resolve => {
        placesService.nearbySearch(request, (results, status, pagination) => {
            resolve({ results, status, pagination });
        });
    });
}
/**
 * Validates that the restaurant is usable for our use-case.
 *
 * Usable in this case means:
 *  - has an actual location
 *  - has a vicinity address-line
 *  - has ratings and ratings-count
 *  - has at least one image
 */
function isUsablePlaceResult(place) {
    const { rating, user_ratings_total: userRatingsTotal, name, vicinity, geometry, photos } = place;
    if (!geometry || !geometry.location) {
        return false;
    }
    if (!photos || photos.length === 0) {
        return false;
    }
    return (Boolean(rating) &&
        Boolean(userRatingsTotal) &&
        Boolean(name) &&
        Boolean(vicinity));
}
/**
 * Converts a (verified, see above) places result to our internal
 * Restaurant type.
 */
function placeResultToRestaurant(place) {
    const { rating, user_ratings_total: userRatingsTotal, price_level: priceLevel, name, vicinity, geometry, photos } = place;
    const photo = photos[0];
    return {
        rating: rating,
        userRatingsTotal: userRatingsTotal,
        priceLevel: priceLevel,
        name: name,
        photo: { url: photo.getUrl(), attribution: photo.html_attributions },
        vicinity: vicinity,
        location: geometry.location.toJSON()
    };
}
/**
 * Retrieves the parent IconMarker3d of the specified object.
 */
function getParentMarker(obj) {
    do {
        if (obj.isIconMarker3d) {
            return obj;
        }
    } while (obj.parent && (obj = obj.parent));
    return null;
}
