import { Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, PlaneGeometry } from 'three';
export interface HtmlMeshProps {
    /**
     * Additional properties for the default-material.
     */
    materialParams?: MeshBasicMaterialParameters;
    /**
     * The html to render.
     */
    html?: string;
    fontStylesheetUrl?: string;
    /**
     * The width of the Mesh in world-units (meters) (default: 10)
     */
    width?: number;
    /**
     * The pixel-size of the canvas-texture, should be a
     * power-of-two number (default: 512)
     */
    textureWidth?: number;
    textureHeight?: number;
}
export default class HtmlMesh extends Mesh {
    material: MeshBasicMaterial;
    geometry: PlaneGeometry;
    private lastProps;
    private canvas;
    constructor(props: HtmlMeshProps);
    update(props: HtmlMeshProps): void;
    private renderHtml;
    private renderSvg;
}
