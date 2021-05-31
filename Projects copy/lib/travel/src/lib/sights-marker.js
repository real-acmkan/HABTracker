"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const html_marker_3d_1 = require("../../../oobe/src/lib/three/html-marker-3d");
// https://stackoverflow.com/a/62094756
const isIOS = (function () {
    const iosQuirkPresent = () => {
        const audio = new Audio();
        audio.volume = 0.5;
        return audio.volume === 1; // volume cannot be changed from "1" on iOS 12 and below
    };
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAppleDevice = navigator.userAgent.includes('Macintosh');
    const isTouchScreen = navigator.maxTouchPoints >= 1; // true for iOS 13 (and hopefully beyond)
    return isIOS || (isAppleDevice && (isTouchScreen || iosQuirkPresent()));
})();
const BUILDINGS_MIN_ZOOM = 17;
const TOPVIEW_MAX_TILT = 30;
class SightsMarker extends html_marker_3d_1.default {
    constructor(props) {
        let htmlMarkerProps = {
            html: renderMarkerHtml(props.label),
            labelHeight: props.altitude,
            width: props.width,
            color: 0x590ed1,
            baseZoom: props.baseZoom,
            fontStylesheetUrl: 'https://fonts.googleapis.com/css?family=Google+Sans:500&display=block'
        };
        // note: ios somehow won't manage to correctly render the labels with
        //   webfonts on the first try, not sure why that is, but the first try
        //   might be the only one a user sees, so just dont use them.
        if (isIOS) {
            delete htmlMarkerProps.fontStylesheetUrl;
        }
        super(htmlMarkerProps);
        this.line.visible = false;
        this.anchorPoint.visible = false;
    }
    update(props) {
        const updateComplete = super.update(props);
        const { zoom, tilt } = props;
        if (zoom !== undefined) {
            const buildingsVisible = zoom >= BUILDINGS_MIN_ZOOM;
            this.line.visible = !buildingsVisible;
            this.anchorPoint.visible = !buildingsVisible;
        }
        if (tilt !== undefined) {
            const isTopDownView = tilt < TOPVIEW_MAX_TILT;
            if (isTopDownView) {
                this.line.visible = false;
                this.anchorPoint.visible = false;
            }
        }
        return updateComplete;
    }
}
exports.default = SightsMarker;
function renderMarkerHtml(label) {
    return `
    <style>
      body {
        margin: 0;
        display: flex;
        flex-flow: column nowrap;
        justify-content: flex-end;
        height: 100%;
      }

      .label {
        position: relative;
        margin: 0 auto 30px;
        font-size: 38px; 
        font-family: 'Google Sans', sans-serif;
        padding: .4em 1em;
        background: #590ed1; 
        border-radius: 20px;
        text-align: center;
        color: white;
        font-weight: 500;
        letter-spacing: 1px;
      }
      
      .label:after { 
        content: ''; 
        position: absolute; bottom: 0; left: 50%; z-index: 1; 
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-top: 30px solid #590ed1;

        transform: translate(-50%, 30px);
    </style>

    <div class="label">${encodeEntities(label)}</div>
  `;
}
const RX_SURROGATE_PAIR = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
const RX_NON_ALPHANUMERIC = /([^\#-~| |!])/g;
function encodeEntities(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(RX_SURROGATE_PAIR, value => {
        const hi = value.charCodeAt(0);
        const low = value.charCodeAt(1);
        return '&#' + ((hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000) + ';';
    })
        .replace(RX_NON_ALPHANUMERIC, value => '&#' + value.charCodeAt(0) + ';')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
