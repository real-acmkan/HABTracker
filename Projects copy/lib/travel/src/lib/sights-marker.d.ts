import HtmlMarker3d, { HtmlMarker3dProps } from '../../../oobe/src/lib/three/html-marker-3d';
export interface SightsMarkerProps {
    label: string;
    width: number;
    altitude: number;
    heading?: number;
    tilt?: number;
    zoom?: number;
    baseZoom?: number;
}
export default class SightsMarker extends HtmlMarker3d {
    constructor(props: SightsMarkerProps);
    update(props: Partial<HtmlMarker3dProps>): boolean;
}
