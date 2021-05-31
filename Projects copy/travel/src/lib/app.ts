import type {Page, PageConstructor} from '../page/page';
import {Basemap} from './basemap';
import {INITIAL_VIEWPORT} from '../config';
import type {AppState} from '../../../oobe/src/lib/store';

export class App {
  private readonly pageTypes: Map<string, PageConstructor<any>> = new Map();
  private readonly pages: Map<string, Page> = new Map();
  private readonly basemap: Basemap;
  private currentPageId: string | null = null;
  private currentPage: Page | null = null;
  public placesService: google.maps.places.PlacesService | undefined;

  readonly ready: Promise<void>;

  constructor() {
    this.basemap = new Basemap(
      <Element>document.querySelector('.map-container'),
      {initialViewport: INITIAL_VIEWPORT}
    );

    // forward map-initialization promise
    this.ready = this.basemap.mapReady;

    this.ready.then(() => {
      this.placesService = new google.maps.places.PlacesService(
        this.basemap.getMapInstance()
      );
    });
  }

  registerPage(pageId: string, page: PageConstructor<any>) {
    this.pageTypes.set(pageId, page);
  }

  update(state: AppState) {
    this.setCurrentPage(state.currentPage);
  }

  setCurrentPage(pageId: string) {
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
  private getPage(pageId: string): Page {
    if (!this.pages.has(pageId)) {
      const PageCtor = <PageConstructor>this.pageTypes.get(pageId);
      const pageEl = document.querySelector<HTMLElement>(`#${pageId}`);

      if (!pageEl) {
        throw new Error(
          `App.setCurrentPage(): failed to find element using selector #${pageId}`
        );
      }

      this.pages.set(
        pageId,
        new PageCtor(pageEl, this.basemap, this.placesService!)
      );
    }

    // can't be null/undefined at this point
    return <Page>this.pages.get(pageId);
  }
}
