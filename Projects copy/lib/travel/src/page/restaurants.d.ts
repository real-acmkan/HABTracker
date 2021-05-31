import { Page } from './page';
export declare class RestaurantsPage extends Page {
    private directionsService;
    private overlay?;
    private mapListeners;
    private originMarker?;
    private markerContainer;
    private restaurantMarkers;
    private markersToAdd;
    private highlightedMarker;
    private selectedMarker;
    private startTime;
    private mousePosition;
    private mapAnimation;
    private delayedAnimationId;
    initialize(): void;
    start(): void;
    update(): boolean;
    stop(): void;
    /**
     * Sets up the scene.
     * @return promise that resolves when everything is complete and added
     *   to the scene.
     */
    private initScene;
    /**
     * Loads nearby restaurants from the places-API and creates 3d-icon markers
     * for them.
     */
    private initRestaurantMarkers;
    /**
     * Updates the walking-directions for the specified marker via the
     * directions-API and creates a DottedDirectionsLine from the results.
     */
    private loadDirections;
    /**
     * Registers event-handlers for the mousemove and click events.
     */
    private bindMapEvents;
    /**
     * Unbinds all the event-handlers from bindMapEvents.
     * @private
     */
    private unbindMapEvents;
    /**
     * Updates the internal raycaster-state and sets/resets the
     * highlighting-state.
     */
    private updateRaycaster;
    /**
     * Sets the specified marker as selected (restoring a previous selction if
     * there is one), updates the directions and the panel-content.
     */
    private setSelectedMarker;
}
