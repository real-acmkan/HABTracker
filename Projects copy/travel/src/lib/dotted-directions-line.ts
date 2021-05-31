import {
  BufferAttribute,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  Path,
  RawShaderMaterial,
  Vector2
} from 'three';

type DottedDirectionsLineParams = {
  color: number;
  opacity: number;
  pointSize: number;
  pointSpacing: number;
};

const MAX_POINTS = 500;

const dottedLineShader = {
  // language=GLSL
  vertexShader: `
    precision highp float;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float pointSize;

    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 instanceOffset;

    varying vec2 vUv;

    void main() {
      vUv = 2.0 * uv - vec2(1.0, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4( pointSize * position + instanceOffset, 1.0 );
    }
  `,

  // language=GLSL
  fragmentShader: `
    precision highp float;

    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;

    void main() {
      if (length(vUv) > 1.0) discard;
      gl_FragColor = vec4(color, opacity);
    }
  `
};

// prettier-ignore
const squarePosition = new Float32Array([
  -0.5, 0.0, -0.5,  -0.5, 0.0, 0.5,  0.5, 0.0, -0.5,
  -0.5, 0.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0, -0.5
]);

// prettier-ignore
const squareUv = new Float32Array([0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]);

export default class DottedDirectionsLine extends Mesh {
  geometry: InstancedBufferGeometry;
  material: RawShaderMaterial;

  params: DottedDirectionsLineParams;

  constructor(
    points: Vector2[],
    params: Partial<DottedDirectionsLineParams> = {}
  ) {
    super();

    const {
      color = 0x4285f4,
      pointSize = 6,
      pointSpacing = 10,
      opacity = 1.0
    } = params;
    this.params = {color, pointSize, pointSpacing, opacity};

    this.frustumCulled = false;

    this.geometry = new InstancedBufferGeometry();
    this.geometry.attributes = {
      position: new BufferAttribute(squarePosition, 3),
      uv: new BufferAttribute(squareUv, 2),
      instanceOffset: new InstancedBufferAttribute(
        new Float32Array(MAX_POINTS * 3),
        3
      )
    };

    this.material = new RawShaderMaterial({
      uniforms: {
        color: {value: new Color(color)},
        opacity: {value: opacity},
        pointSize: {value: pointSize}
      },
      ...dottedLineShader
    });

    this.setPoints(points);
  }

  setPoints(points: Vector2[]) {
    const attr = this.geometry.getAttribute('instanceOffset');

    const path = new Path(points);
    const spacedPoints = path.getSpacedPoints(
      path.getLength() / this.params.pointSpacing
    );

    if (spacedPoints.length > attr.array.length / 3) {
      console.warn(
        `DottedDirectionsLine: too many points, max allowed` +
          ` is ${MAX_POINTS}, got ${spacedPoints.length}`
      );
    }

    for (let i = 0; i < spacedPoints.length; i++) {
      const {x, y} = spacedPoints[i];
      attr.setXYZ(i, x, 0, y);
    }

    this.geometry.instanceCount = spacedPoints.length;
  }
}
