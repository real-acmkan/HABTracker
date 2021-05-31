/// <reference types="google.maps" />
import type { Basemap, MapOverlayInterface } from '../lib/basemap';
export interface PageConstructor<T extends Page = Page> {
    new (rootEl: HTMLElement, basemap: Basemap, placesService: google.maps.places.PlacesService): T;
}
export declare class Page {
    private isInitialized;
    protected readonly basemap: Basemap;
    protected readonly rootEl: HTMLElement;
    protected readonly placesService: google.maps.places.PlacesService;
    protected mapOverlays: MapOverlayInterface[];
    constructor(rootEl: HTMLElement, basemap: Basemap, placesService: google.maps.places.PlacesService);
    initialize(): void;
    stop(): void;
    start(): void;
    show(): void;
    hide(): void;
}
