import { Color, Group, Mesh } from 'three';
export interface HtmlMarker3dProps {
    html?: string;
    width?: number;
    fontStylesheetUrl?: string;
    color?: Color | string | number;
    labelHeight?: number;
    heading?: number;
    tilt?: number;
    zoom?: number;
    baseZoom?: number;
}
export default class HtmlMarker3d extends Group {
    readonly isIconMarker3d: boolean;
    private readonly htmlMesh;
    private readonly labelGroup;
    protected readonly anchorPoint: Mesh;
    protected readonly line: Mesh;
    private readonly material;
    private lastProps;
    constructor(props: HtmlMarker3dProps);
    update(props: Partial<HtmlMarker3dProps>): boolean;
    private updateOrientation;
    /**
     * Stepwise approach to an orientation appropriate for the given mapHeading.
     * @param mapHeading heading of the camera
     * @returns boolean indicating if the target-orientation is reached
     */
    private adjustMarkerRotation;
}
