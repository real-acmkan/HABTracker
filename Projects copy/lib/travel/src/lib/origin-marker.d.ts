import { Color, Group } from 'three';
declare type OriginMarkerProps = {
    color?: number | string | Color;
    size?: number;
    heading?: number;
    tilt?: number;
    zoom?: number;
    baseZoom?: number;
};
export default class OriginMarker extends Group {
    private readonly originMarker;
    private readonly originMarkerTop;
    private lastProps;
    constructor(props: OriginMarkerProps);
    update(props: OriginMarkerProps): void;
}
export {};
