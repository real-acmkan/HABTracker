import {
  CanvasTexture,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  PlaneGeometry
} from 'three';

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
  width?: number; // world-units
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

  private lastProps: HtmlMeshProps;
  private canvas: HTMLCanvasElement;

  constructor(props: HtmlMeshProps) {
    super();

    const {materialParams} = props;
    this.canvas = document.createElement('canvas');

    this.geometry = new PlaneGeometry(1, 1);
    let canvasTexture = new CanvasTexture(this.canvas);
    canvasTexture.premultiplyAlpha = true;
    canvasTexture.anisotropy = 4;

    // document.body.appendChild(this.canvas);
    // this.canvas.style.cssText = `position: fixed; bottom: 0; right: 0;`;

    this.material = new MeshBasicMaterial({
      transparent: true,
      color: 0xffffff,
      ...materialParams,
      alphaTest: 0.5,
      map: canvasTexture,
      side: DoubleSide
    });
    this.lastProps = {};
    this.update(props);
  }

  update(props: HtmlMeshProps) {
    const {
      html = '',
      width = 10, // world-units
      textureWidth = 512,
      textureHeight = 512,
      fontStylesheetUrl = ''
    } = props;

    let textureSizeChanged =
      textureWidth !== this.lastProps.textureWidth ||
      textureHeight !== this.lastProps.textureHeight;

    if (textureSizeChanged || width !== this.lastProps.width) {
      const aspectRatio = textureWidth / textureHeight;
      const height = width / aspectRatio;

      this.canvas.width = textureWidth;
      this.canvas.height = textureHeight;

      this.scale.set(width, height, 1);
      this.position.y = width / 2;

      this.lastProps.width = width;
      this.lastProps.textureWidth = textureWidth;
      this.lastProps.textureHeight = textureHeight;
    }

    if (
      textureSizeChanged ||
      html !== this.lastProps.html ||
      fontStylesheetUrl !== this.lastProps.fontStylesheetUrl
    ) {
      this.renderHtml(html, fontStylesheetUrl).then(() => {
        this.material.map!.needsUpdate = true;
      });
      this.lastProps.html = html;
    }

    if (props.materialParams) {
      (this.material as Material).setValues(props.materialParams);
      this.lastProps.materialParams = props.materialParams;
    }
  }

  private async renderHtml(
    html: string,
    googleFontsUrl?: string
  ): Promise<void> {
    let fontStylesheet = '';
    if (googleFontsUrl) {
      fontStylesheet = await getFontStylesheet(googleFontsUrl);
    }

    const {width, height} = this.canvas;

    return this.renderSvg(`
      <svg xmlns='http://www.w3.org/2000/svg'  
          width='${width}'
          height='${height}'
          viewBox='0 0 ${width} ${height}'
          externalResourcesRequired='true'>
        <foreignObject width='${width}px' height='${height}px' requiredExtensions='http://www.w3.org/1999/xhtml'>
          <body xmlns='http://www.w3.org/1999/xhtml'>
            ${fontStylesheet ? `<style>${fontStylesheet}</style>` : ''}
            ${html}
          </body>
        </foreignObject>
      </svg>
    `);
  }

  private async renderSvg(svgCode: string): Promise<void> {
    const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    const {width, height} = this.canvas;

    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgCode)}`;
    });
  }
}

const stylesheetMap = new Map<string, Promise<string>>();
const fontUrlMap = new Map<string, Promise<string>>();

async function getFontStylesheet(fontStylesheetUrl: string): Promise<string> {
  if (stylesheetMap.has(fontStylesheetUrl)) {
    return stylesheetMap.get(fontStylesheetUrl)!;
  }

  const promise = loadFontStylesheet(fontStylesheetUrl);
  stylesheetMap.set(fontStylesheetUrl, promise);

  return await promise;
}

async function loadFontStylesheet(fontStylesheetUrl: string): Promise<string> {
  const res = await fetch(fontStylesheetUrl);
  let cssText = await res.text();

  const rxUrl = /url\(([^)]*)\)/g;

  let match;
  while ((match = rxUrl.exec(cssText))) {
    const [, url] = match;
    fontUrlMap.set(url, loadAsDataUrl(url));
  }

  for (let [url, dataUrlPromise] of fontUrlMap.entries()) {
    cssText = cssText.replaceAll(url, await dataUrlPromise);
  }

  return cssText;
}

async function loadAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
}
