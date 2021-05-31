import { InstancedBufferGeometry, Mesh, RawShaderMaterial, Vector2 } from 'three';
declare type DottedDirectionsLineParams = {
    color: number;
    opacity: number;
    pointSize: number;
    pointSpacing: number;
};
export default class DottedDirectionsLine extends Mesh {
    geometry: InstancedBufferGeometry;
    material: RawShaderMaterial;
    params: DottedDirectionsLineParams;
    constructor(points: Vector2[], params?: Partial<DottedDirectionsLineParams>);
    setPoints(points: Vector2[]): void;
}
export {};
