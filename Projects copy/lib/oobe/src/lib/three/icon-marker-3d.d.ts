import { Color, Group } from 'three';
export interface IconMarkerProps {
    iconSrc?: string;
    iconSize?: number;
    color?: Color | string | number;
    labelHeight?: number;
    heading?: number;
    tilt?: number;
    zoom?: number;
    baseZoom?: number;
}
export default class IconMarker3d extends Group {
    readonly isIconMarker3d: boolean;
    private readonly icon;
    private readonly labelGroup;
    private readonly anchorPoint;
    private readonly line;
    private readonly material;
    private lastProps;
    constructor(props: IconMarkerProps);
    update(props: Partial<IconMarkerProps>): void;
    static prefetchIcons(...urls: string[]): void;
}
