"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const html_mesh_1 = require("./html-mesh");
class HtmlMarker3d extends three_1.Group {
    constructor(props) {
        super();
        this.isIconMarker3d = true;
        const { html = '', fontStylesheetUrl = '', width = 120, color = 0xdb4437, labelHeight = 40 } = props;
        this.lastProps = {};
        this.htmlMesh = new html_mesh_1.default({ html, fontStylesheetUrl, width });
        this.labelGroup = new three_1.Group();
        this.labelGroup.add(this.htmlMesh);
        this.labelGroup.rotation.reorder('YXZ');
        this.material = new three_1.MeshBasicMaterial({ color });
        this.line = new three_1.Mesh(new three_1.CylinderGeometry(1, 1, 1, 16, 3), this.material);
        this.line.geometry.translate(0, 0.5, 0);
        this.anchorPoint = new three_1.Mesh(new three_1.SphereGeometry(3, 12, 8, 0, 2 * Math.PI, 0, Math.PI / 2), this.material);
        this.update({ html, width, color, labelHeight, ...props });
        this.add(this.line, this.anchorPoint, this.labelGroup);
    }
    update(props) {
        let { color, html, width, labelHeight, heading, tilt, zoom, baseZoom } = props;
        let updateFinished = true;
        if (color !== undefined) {
            this.material.color.set(color);
        }
        if ((html !== undefined && html !== this.lastProps.html) ||
            (width !== undefined && width !== this.lastProps.width)) {
            this.htmlMesh.update({ html, width });
        }
        if (labelHeight !== undefined) {
            this.labelGroup.position.y = labelHeight;
            this.line.scale.y = labelHeight;
        }
        if (heading !== undefined && tilt !== undefined && zoom !== undefined) {
            if (baseZoom === undefined) {
                baseZoom = this.lastProps.baseZoom;
            }
            if (baseZoom !== undefined) {
                this.updateOrientation(heading, tilt, zoom, baseZoom);
            }
        }
        this.lastProps = { ...this.lastProps, ...props };
        return updateFinished;
    }
    updateOrientation(heading, tilt, zoom, baseZoom) {
        const showTopView = tilt < 30;
        let updateFinished = true;
        if (showTopView) {
            this.labelGroup.rotation.y = -three_1.MathUtils.DEG2RAD * heading;
        }
        else {
            this.adjustMarkerRotation(heading);
        }
        this.labelGroup.rotation.x = showTopView ? -Math.PI / 2 : 0;
        // adjust scale according to zoom-level
        let scaleFactor = Math.pow(1.6, baseZoom - zoom);
        this.labelGroup.scale.setScalar(scaleFactor);
        this.line.scale.x = this.line.scale.z = scaleFactor;
        this.anchorPoint.scale.setScalar(scaleFactor);
        return updateFinished;
    }
    /**
     * Stepwise approach to an orientation appropriate for the given mapHeading.
     * @param mapHeading heading of the camera
     * @returns boolean indicating if the target-orientation is reached
     */
    adjustMarkerRotation(mapHeading) {
        const sectorHeading = (Math.round(mapHeading / 90) * 90) % 360;
        let currRotation = this.labelGroup.rotation.y;
        let targetRotation = three_1.MathUtils.DEG2RAD * three_1.MathUtils.euclideanModulo(-sectorHeading, 360);
        // if the way to go is sufficiently small (0.05rad ~ 2.8°), end the
        // animation and lock the rotation to the proper value
        if (Math.abs(currRotation - targetRotation) < 0.1) {
            this.labelGroup.rotation.y = targetRotation;
            return true;
        }
        // if there's a difference of more than 180°, it has to be either 0° -> 270°
        // or the other way around. In this case, adding/removing 360° makes this
        // 0° -> -90° or 270° -> 360° (this will be corrected for at the end of
        // the animation)
        const dh = targetRotation - currRotation;
        if (Math.abs(dh) > Math.PI) {
            targetRotation -= 2 * Math.PI * Math.sign(dh);
        }
        this.labelGroup.rotation.y =
            currRotation + (targetRotation - currRotation) * 0.3;
        return false;
    }
}
exports.default = HtmlMarker3d;
