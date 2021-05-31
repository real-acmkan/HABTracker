"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const textureLoader = new three_1.TextureLoader();
const textureCache = new Map();
class IconMarker3d extends three_1.Group {
    constructor(props) {
        super();
        this.isIconMarker3d = true;
        const { iconSrc = '', iconSize = 10, color = 0xdb4437, labelHeight = 40 } = props;
        this.lastProps = {};
        this.icon = new three_1.Mesh(new three_1.PlaneGeometry(1, 1), new three_1.MeshBasicMaterial({
            color: 0xffffff,
            alphaTest: 0.5,
            side: three_1.DoubleSide
        }));
        this.labelGroup = new three_1.Group();
        this.labelGroup.add(this.icon);
        this.material = new three_1.MeshBasicMaterial({ color });
        this.line = new three_1.Mesh(new three_1.CylinderGeometry(iconSize * 0.03, iconSize * 0.03, 1, 16, 3), this.material);
        this.line.geometry.translate(0, 0.5, 0);
        this.anchorPoint = new three_1.Mesh(new three_1.SphereGeometry(iconSize * 0.1, 12, 8, 0, 2 * Math.PI, 0, Math.PI / 2), this.material);
        this.update({ iconSrc, iconSize, color, labelHeight, ...props });
        this.add(this.line, this.anchorPoint, this.labelGroup);
    }
    update(props) {
        let { color, iconSrc, iconSize, labelHeight, heading, tilt, zoom, baseZoom } = props;
        if (color !== undefined) {
            this.material.color.set(color);
        }
        if (iconSrc !== undefined && iconSrc !== this.lastProps.iconSrc) {
            if (!textureCache.has(iconSrc)) {
                textureCache.set(iconSrc, textureLoader.load(iconSrc));
            }
            this.icon.material.map = textureCache.get(iconSrc);
        }
        if (labelHeight !== undefined) {
            this.labelGroup.position.y = labelHeight;
            this.line.scale.y = labelHeight;
        }
        if (heading !== undefined && tilt !== undefined) {
            this.icon.rotation.set(((-90 + tilt) / 180) * Math.PI, (-heading / 180) * Math.PI, 0, 'YXZ');
        }
        baseZoom = baseZoom || this.lastProps.baseZoom;
        if (zoom !== undefined && baseZoom !== undefined) {
            this.scale.setScalar(Math.pow(1.6, baseZoom - zoom));
        }
        if (iconSize !== undefined) {
            this.icon.position.y = 1 + iconSize / 2;
            this.icon.scale.setScalar(iconSize);
        }
        this.lastProps = { ...this.lastProps, ...props };
    }
    static prefetchIcons(...urls) {
        for (let url of urls) {
            if (!textureCache.has(url)) {
                textureCache.set(url, textureLoader.load(url));
            }
        }
    }
}
exports.default = IconMarker3d;
