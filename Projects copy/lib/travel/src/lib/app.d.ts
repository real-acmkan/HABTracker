/// <reference types="google.maps" />
import type { PageConstructor } from '../page/page';
import type { AppState } from '../../../oobe/src/lib/store';
export declare class App {
    private readonly pageTypes;
    private readonly pages;
    private readonly basemap;
    private currentPageId;
    private currentPage;
    placesService: google.maps.places.PlacesService | undefined;
    readonly ready: Promise<void>;
    constructor();
    registerPage(pageId: string, page: PageConstructor<any>): void;
    update(state: AppState): void;
    setCurrentPage(pageId: string): void;
    /**
     * Gets an existing page-instance or creates it when retrieved for the first time
     * @param pageId
     * @private
     */
    private getPage;
}
