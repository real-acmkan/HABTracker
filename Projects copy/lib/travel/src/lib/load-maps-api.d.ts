interface MapsApiOptions {
    v: string;
    key: string;
    map_ids: string;
    libraries?: string;
}
declare global {
    interface Window {
        __maps_callback__?: () => void;
    }
}
export declare function loadMapsApi(apiOptions: MapsApiOptions): Promise<void>;
export {};
