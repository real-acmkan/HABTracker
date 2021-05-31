"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
class HtmlMesh extends three_1.Mesh {
    constructor(props) {
        super();
        const { materialParams } = props;
        this.canvas = document.createElement('canvas');
        this.geometry = new three_1.PlaneGeometry(1, 1);
        let canvasTexture = new three_1.CanvasTexture(this.canvas);
        canvasTexture.premultiplyAlpha = true;
        canvasTexture.anisotropy = 4;
        // document.body.appendChild(this.canvas);
        // this.canvas.style.cssText = `position: fixed; bottom: 0; right: 0;`;
        this.material = new three_1.MeshBasicMaterial({
            transparent: true,
            color: 0xffffff,
            ...materialParams,
            alphaTest: 0.5,
            map: canvasTexture,
            side: three_1.DoubleSide
        });
        this.lastProps = {};
        this.update(props);
    }
    update(props) {
        const { html = '', width = 10, // world-units
        textureWidth = 512, textureHeight = 512, fontStylesheetUrl = '' } = props;
        let textureSizeChanged = textureWidth !== this.lastProps.textureWidth ||
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
        if (textureSizeChanged ||
            html !== this.lastProps.html ||
            fontStylesheetUrl !== this.lastProps.fontStylesheetUrl) {
            this.renderHtml(html, fontStylesheetUrl).then(() => {
                this.material.map.needsUpdate = true;
            });
            this.lastProps.html = html;
        }
        if (props.materialParams) {
            this.material.setValues(props.materialParams);
            this.lastProps.materialParams = props.materialParams;
        }
    }
    async renderHtml(html, googleFontsUrl) {
        let fontStylesheet = '';
        if (googleFontsUrl) {
            fontStylesheet = await getFontStylesheet(googleFontsUrl);
        }
        const { width, height } = this.canvas;
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
    async renderSvg(svgCode) {
        const ctx = this.canvas.getContext('2d');
        const { width, height } = this.canvas;
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
exports.default = HtmlMesh;
const stylesheetMap = new Map();
const fontUrlMap = new Map();
async function getFontStylesheet(fontStylesheetUrl) {
    if (stylesheetMap.has(fontStylesheetUrl)) {
        return stylesheetMap.get(fontStylesheetUrl);
    }
    const promise = loadFontStylesheet(fontStylesheetUrl);
    stylesheetMap.set(fontStylesheetUrl, promise);
    return await promise;
}
async function loadFontStylesheet(fontStylesheetUrl) {
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
async function loadAsDataUrl(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
}
