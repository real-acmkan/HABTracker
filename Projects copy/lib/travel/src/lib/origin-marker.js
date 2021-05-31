"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const origin_icon_svg_1 = require("bundle-text:../../public/images/origin-icon.svg");
const origin_icon_top_svg_1 = require("bundle-text:../../public/images/origin-icon-top.svg");
var IconType;
(function (IconType) {
    IconType[IconType["default"] = 0] = "default";
    IconType[IconType["top"] = 1] = "top";
})(IconType || (IconType = {}));
const textureLoader = new three_1.TextureLoader();
class OriginMarker extends three_1.Group {
    constructor(props) {
        super();
        this.lastProps = {};
        this.originMarker = new three_1.Mesh(new three_1.PlaneGeometry(), new three_1.MeshBasicMaterial({
            alphaTest: 0.5,
            transparent: true
        }));
        this.originMarker.geometry.translate(0, 0.5, 0);
        this.originMarkerTop = new three_1.Mesh(new three_1.PlaneGeometry(), new three_1.MeshBasicMaterial({
            alphaTest: 0.5,
            transparent: true
        }));
        this.originMarkerTop.geometry.rotateX(-Math.PI / 2);
        this.add(this.originMarker, this.originMarkerTop);
        this.update(props);
    }
    update(props) {
        let { color, heading, tilt, size, zoom, baseZoom } = props;
        if (color !== undefined && color !== this.lastProps.color) {
            this.originMarker.material.map = textureLoader.load(getSvgIconDataUrl(IconType.default, color));
            this.originMarkerTop.material.map =
                textureLoader.load(getSvgIconDataUrl(IconType.top, color));
        }
        baseZoom = baseZoom !== undefined ? baseZoom : this.lastProps.baseZoom;
        if (zoom !== undefined && baseZoom !== undefined) {
            this.scale.setScalar(Math.pow(1.6, baseZoom - zoom));
        }
        if (baseZoom !== undefined) {
            this.lastProps.baseZoom = baseZoom;
        }
        if (tilt !== undefined && tilt !== this.lastProps.tilt) {
            this.originMarker.visible = tilt > 30;
            this.originMarkerTop.visible = tilt <= 30;
            this.lastProps.tilt = tilt;
        }
        if (size !== undefined && size !== this.lastProps.size) {
            this.originMarker.scale.setScalar(size);
            this.originMarkerTop.scale.setScalar(size / 2);
            this.lastProps.size = size;
        }
        if (heading !== undefined && heading !== this.lastProps.heading) {
            this.originMarker.rotation.y = (-heading / 180) * Math.PI;
            this.lastProps.heading = heading;
        }
    }
}
exports.default = OriginMarker;
const tmpColor = new three_1.Color();
function getSvgIconDataUrl(type, color) {
    const svg = type === IconType.default ? origin_icon_svg_1.default : origin_icon_top_svg_1.default;
    tmpColor.set(color);
    return ('data:image/svg+xml;base64,' +
        btoa(svg.replace(/#000000/g, '#' + tmpColor.getHexString())));
}
