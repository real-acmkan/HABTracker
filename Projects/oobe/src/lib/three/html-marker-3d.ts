import {
  Color,
  CylinderGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry
} from 'three';
import HtmlMesh from './html-mesh';

export interface HtmlMarker3dProps {
  html?: string;
  width?: number;
  fontStylesheetUrl?: string;
  color?: Color | string | number;
  labelHeight?: number;
  heading?: number;
  tilt?: number;
  zoom?: number;
  baseZoom?: number;
}

export default class HtmlMarker3d extends Group {
  readonly isIconMarker3d: boolean = true;

  private readonly htmlMesh: HtmlMesh;
  private readonly labelGroup: Group;
  protected readonly anchorPoint: Mesh;
  protected readonly line: Mesh;
  private readonly material: MeshBasicMaterial;
  private lastProps: HtmlMarker3dProps;

  constructor(props: HtmlMarker3dProps) {
    super();

    const {
      html = '',
      fontStylesheetUrl = '',
      width = 120,
      color = 0xdb4437,
      labelHeight = 40
    } = props;

    this.lastProps = {};
    this.htmlMesh = new HtmlMesh({html, fontStylesheetUrl, width});

    this.labelGroup = new Group();
    this.labelGroup.add(this.htmlMesh);
    this.labelGroup.rotation.reorder('YXZ');

    this.material = new MeshBasicMaterial({color});
    this.line = new Mesh(new CylinderGeometry(1, 1, 1, 16, 3), this.material);
    this.line.geometry.translate(0, 0.5, 0);

    this.anchorPoint = new Mesh(
      new SphereGeometry(3, 12, 8, 0, 2 * Math.PI, 0, Math.PI / 2),
      this.material
    );

    this.update({html, width, color, labelHeight, ...props});

    this.add(this.line, this.anchorPoint, this.labelGroup);
  }

  update(props: Partial<HtmlMarker3dProps>): boolean {
    let {color, html, width, labelHeight, heading, tilt, zoom, baseZoom} =
      props;

    let updateFinished = true;

    if (color !== undefined) {
      this.material.color.set(color);
    }

    if (
      (html !== undefined && html !== this.lastProps.html) ||
      (width !== undefined && width !== this.lastProps.width)
    ) {
      this.htmlMesh.update({html, width});
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
    this.lastProps = {...this.lastProps, ...props};

    return updateFinished;
  }

  private updateOrientation(
    heading: number,
    tilt: number,
    zoom: number,
    baseZoom: number
  ): boolean {
    const showTopView = tilt < 30;
    let updateFinished = true;

    if (showTopView) {
      this.labelGroup.rotation.y = -MathUtils.DEG2RAD * heading;
    } else {
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
  private adjustMarkerRotation(mapHeading: number): boolean {
    const sectorHeading = (Math.round(mapHeading / 90) * 90) % 360;

    let currRotation = this.labelGroup.rotation.y;
    let targetRotation =
      MathUtils.DEG2RAD * MathUtils.euclideanModulo(-sectorHeading, 360);

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
