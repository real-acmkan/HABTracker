import {Group, MathUtils, Object3D, Vector2} from 'three';

import DottedDirectionsLine from '../lib/dotted-directions-line';
import {Page} from './page';
import {easeInOutQuint} from '../lib/easings';
import addPlacesImageCredits from '../lib/add-places-image-credits';

import RESTAURANTS_ICON from 'url:../../public/images/restaurants-icon.svg';
import RESTAURANTS_ICON_INVERTED from 'url:../../public/images/restaurants-icon-inverted.svg';
import RESTAURANTS_ICON_HOVER from 'url:../../public/images/restaurants-icon-hover.svg';
import OriginMarker from '../lib/origin-marker';
import ThreeJSOverlayView from '../../../oobe/src/lib/map/threejs-overlay-view';
import IconMarker3d from '../../../oobe/src/lib/three/icon-marker-3d';
import type {CameraAnimation} from '../../../oobe/src/lib/map/camera-animation';

interface Restaurant {
  rating: number;
  userRatingsTotal: number;
  name: string;
  photo: {
    url: string;
    attribution?: string[];
  };
  location: google.maps.LatLngLiteral;
  vicinity: string;
  priceLevel?: number;
}

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
  center: {lat: 51.50663929607001, lng: -0.14198304637023096},
  heading: 41,
  tilt: 67.5,
  zoom: 17
};

// doesn't seem possible to get this from the map-instance otherwise
const DEFAULT_DRAGGABLE_CURSOR =
  'url("https://maps.gstatic.com/mapfiles/openhand_8_8.cur"), default';

const PERSON_POSITION = {
  lat: 51.50693850015297,
  lng: -0.1423229107977919,
  altitude: 0
};

const MARKER_DEFAULT_STYLE = {
  iconSrc: RESTAURANTS_ICON,
  color: 0xdb4437,
  iconSize: 30,
  baseZoom: defaultCamera.zoom,
  labelHeight: 60
};

const ANIMATION_DURATION = 1500;
const ANIMATION_DELAY = 300;

export class RestaurantsPage extends Page {
  private directionsService: google.maps.DirectionsService | null = null;

  private overlay?: ThreeJSOverlayView;
  private mapListeners: google.maps.MapsEventListener[] = [];
  private originMarker?: OriginMarker;
  private markerContainer: Group = new Group();

  private restaurantMarkers: IconMarker3d[] = [];
  private markersToAdd: IconMarker3d[] = [];
  private highlightedMarker: IconMarker3d | null = null;
  private selectedMarker: IconMarker3d | null = null;

  private startTime: number = 0;
  private mousePosition: Vector2 = new Vector2();
  private mapAnimation: CameraAnimation | null = null;

  private delayedAnimationId: number = 0;

  initialize() {
    const overlay = new ThreeJSOverlayView(defaultCamera.center);
    overlay.update = () => this.update();

    this.overlay = overlay;
    this.mapOverlays.push(overlay);

    IconMarker3d.prefetchIcons(
      RESTAURANTS_ICON,
      RESTAURANTS_ICON_HOVER,
      RESTAURANTS_ICON_INVERTED
    );

    this.initScene().then(() => overlay.requestRedraw());

    this.directionsService = new google.maps.DirectionsService();
  }

  start() {
    this.bindMapEvents();
    this.startTime = performance.now();
    this.basemap.setCamera(animationStartCamera);

    this.delayedAnimationId = window.setTimeout(() => {
      this.delayedAnimationId = 0;
      this.mapAnimation = this.basemap.animateToLinear(
        defaultCamera,
        ANIMATION_DURATION,
        easeInOutQuint
      );
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
        let randomMarker = this.markersToAdd.splice(
          MathUtils.randInt(0, this.markersToAdd.length - 1),
          1
        );

        this.markerContainer.add(...randomMarker);
      }
    }

    // update origin-marker
    if (this.originMarker) {
      this.originMarker.update({heading, tilt, zoom});
    }

    // update marker-styles based on selected/highlighted markers
    for (const marker of this.restaurantMarkers) {
      let markerProps = {...MARKER_DEFAULT_STYLE, zoom, heading, tilt};

      if (marker.userData.isSelected) {
        markerProps.color = 0xdb4437;
        markerProps.iconSrc = RESTAURANTS_ICON_INVERTED;
        markerProps.labelHeight *= 1.3;
        markerProps.iconSize *= 1.2;
      } else if (marker.userData.isHighlighted) {
        markerProps.color = 0xa4332a;
        markerProps.iconSrc = RESTAURANTS_ICON_HOVER;
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
  private async initScene() {
    const overlay = this.overlay!;
    const scene = overlay.getScene();

    this.originMarker = new OriginMarker({
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
  private async initRestaurantMarkers() {
    const overlay = this.overlay!;

    const restaurants = await queryRestaurants(
      this.placesService,
      defaultCamera.center,
      1000
    );

    const referencePoint = overlay.latLngAltToVector3({
      ...PERSON_POSITION,
      altitude: 0
    });
    let closestMarker = null;
    let minDist = Infinity;

    for (let restaurant of restaurants) {
      const marker = new IconMarker3d({
        iconSrc: RESTAURANTS_ICON,
        iconSize: 35,
        baseZoom: defaultCamera.zoom,
        labelHeight: 60
      });

      overlay.latLngAltToVector3(
        {...restaurant.location, altitude: 0},
        marker.position
      );

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
  private async loadDirections(marker: IconMarker3d) {
    if (marker.userData.directionsLine) {
      return;
    }

    const overlay = this.overlay!;
    const restaurant: Restaurant = marker.userData.restaurant;

    const result = await this.directionsService!.route({
      origin: PERSON_POSITION,
      destination: restaurant.location,
      travelMode: google.maps.TravelMode.WALKING
    });

    if (result === null || result.routes.length === 0) {
      console.warn('no routing result!');
      return;
    }

    const route = result.routes[0].overview_path;
    const directionsLine = new DottedDirectionsLine(
      route.map(ll => overlay.latLngAltToVector2(ll.toJSON())),
      {color: 0xdb4437, opacity: 1, pointSize: 5, pointSpacing: 10}
    );

    directionsLine.visible = false;
    overlay.getScene().add(directionsLine);

    marker.userData.directionsLine = directionsLine;
  }

  /**
   * Registers event-handlers for the mousemove and click events.
   */
  private bindMapEvents() {
    const overlay = this.overlay!;
    const map = this.basemap.getMapInstance();
    const mapDiv = map.getDiv();

    const updateMousePosition = (ev: google.maps.MapMouseEvent) => {
      const domEvent = <MouseEvent>ev.domEvent;
      const mapRect = mapDiv.getBoundingClientRect();

      const x = domEvent.clientX - mapRect.left;
      const y = domEvent.clientY - mapRect.top;
      this.mousePosition.set(
        (2 * x) / mapRect.width - 1,
        1 - (2 * y) / mapRect.height
      );
    };

    const mousemoveListener = map.addListener(
      'mousemove',
      (ev: google.maps.MapMouseEvent) => {
        updateMousePosition(ev);
        // we can't rely on a running update-loop for this demo.
        overlay.requestRedraw();
      }
    );

    const clickListener = map.addListener(
      'click',
      (ev: google.maps.MapMouseEvent) => {
        updateMousePosition(ev);
        this.updateRaycaster();

        if (this.highlightedMarker) {
          this.setSelectedMarker(this.highlightedMarker);
          overlay.requestRedraw();
        }
      }
    );

    this.mapListeners = [mousemoveListener, clickListener];
  }

  /**
   * Unbinds all the event-handlers from bindMapEvents.
   * @private
   */
  private unbindMapEvents() {
    this.mapListeners.forEach(listener => listener.remove());
    this.mapListeners = [];
  }

  /**
   * Updates the internal raycaster-state and sets/resets the
   * highlighting-state.
   */
  private updateRaycaster() {
    const intersections = this.overlay!.raycast(this.mousePosition);

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
  private setSelectedMarker(marker: IconMarker3d) {
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

// ---- utility and helper functions below

/**
 * Loads and filters restaurants in a radius around the current location.
 */
async function queryRestaurants(
  service: google.maps.places.PlacesService,
  location: google.maps.LatLngLiteral,
  radius: number
): Promise<Restaurant[]> {
  const {results, status} = await placesNearbySearchAsync(service, {
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
function updateRestaurantDetails(restaurant: Restaurant) {
  const {photo, name, rating, userRatingsTotal, vicinity, priceLevel} =
    restaurant;

  const rootEl = <HTMLElement>document.querySelector('#restaurants');
  const entities = (s: string): string =>
    s
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
      ${priceLevel ?`<div class='restaurant-price-container'>${'£'.repeat(priceLevel)}</div>` : ''}
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

  addPlacesImageCredits(photo, rootEl);
}

/**
 * Async wrapper for PlacesService.nearbySearch().
 */
async function placesNearbySearchAsync(
  placesService: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest
): AsyncPlaceSearchResult {
  return new Promise(resolve => {
    placesService.nearbySearch(request, (results, status, pagination) => {
      resolve({results, status, pagination});
    });
  });
}

type AsyncPlaceSearchResult = Promise<{
  results: google.maps.places.PlaceResult[] | null;
  status: google.maps.places.PlacesServiceStatus;
  pagination: google.maps.places.PlaceSearchPagination | null;
}>;

/**
 * Validates that the restaurant is usable for our use-case.
 *
 * Usable in this case means:
 *  - has an actual location
 *  - has a vicinity address-line
 *  - has ratings and ratings-count
 *  - has at least one image
 */
function isUsablePlaceResult(place: google.maps.places.PlaceResult): boolean {
  const {
    rating,
    user_ratings_total: userRatingsTotal,
    name,
    vicinity,
    geometry,
    photos
  } = place;

  if (!geometry || !geometry.location) {
    return false;
  }

  if (!photos || photos.length === 0) {
    return false;
  }

  return (
    Boolean(rating) &&
    Boolean(userRatingsTotal) &&
    Boolean(name) &&
    Boolean(vicinity)
  );
}

/**
 * Converts a (verified, see above) places result to our internal
 * Restaurant type.
 */
function placeResultToRestaurant(
  place: google.maps.places.PlaceResult
): Restaurant {
  const {
    rating,
    user_ratings_total: userRatingsTotal,
    price_level: priceLevel,
    name,
    vicinity,
    geometry,
    photos
  } = place;

  const photo = photos![0];

  return {
    rating: rating!,
    userRatingsTotal: userRatingsTotal!,
    priceLevel: priceLevel!,
    name: name!,
    photo: {url: photo.getUrl(), attribution: photo.html_attributions},
    vicinity: vicinity!,
    location: geometry!.location!.toJSON()
  };
}

/**
 * Retrieves the parent IconMarker3d of the specified object.
 */
function getParentMarker(obj: Object3D): IconMarker3d | null {
  do {
    if ((<IconMarker3d>obj).isIconMarker3d) {
      return <IconMarker3d>obj;
    }
  } while (obj.parent && (obj = obj.parent));

  return null;
}
