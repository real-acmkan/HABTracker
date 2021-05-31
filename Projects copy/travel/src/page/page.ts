import type {Basemap, MapOverlayInterface} from '../lib/basemap';

export interface PageConstructor<T extends Page = Page> {
  new (
    rootEl: HTMLElement,
    basemap: Basemap,
    placesService: google.maps.places.PlacesService
  ): T;
}

export class Page {
  private isInitialized: boolean;

  protected readonly basemap: Basemap;
  protected readonly rootEl: HTMLElement;
  protected readonly placesService: google.maps.places.PlacesService;
  protected mapOverlays: MapOverlayInterface[] = [];

  constructor(
    rootEl: HTMLElement,
    basemap: Basemap,
    placesService: google.maps.places.PlacesService
  ) {
    this.isInitialized = false;
    this.rootEl = rootEl;
    this.basemap = basemap;
    this.placesService = placesService;
  }

  initialize(): void {}

  stop() {}

  start() {}

  show() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.initialize();
    }

    for (let overlay of this.mapOverlays) {
      overlay.setMap(this.basemap!.getMapInstance());
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
