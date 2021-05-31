/// <reference types="google.maps" />
import { Page } from './page';
import type { LatLngAltitudeLiteral } from '../../../oobe/src/lib/types';
export interface Attraction {
    place: google.maps.places.PlaceResult;
    coordinates: LatLngAltitudeLiteral;
}
/**
 * Shows a couple of landmarks in london loaded from the places-API along
 * with a walking-directions line connecting all of them and back to the
 * hotel.
 */
export declare class SightsPage extends Page {
    private overlay;
    private directionsService?;
    private attractions;
    private markers;
    private originMarker?;
    private accomodationMarker?;
    private mapAnimation;
    private introAnimationTimer;
    initialize(): Promise<void>;
    start(): void;
    update(): void;
    stop(): void;
    /**
     * Sets up the scene with all the markers for current position,
     * attractions and accomodation.
     */
    private initScene;
    /**
     * Creates an attractions-marker for the given attraction.
     */
    private createMarker;
    /**
     * Loads the routing along the waypoints specified above and adds the
     * resulting polyline to the scene.
     */
    private loadDirections;
}
