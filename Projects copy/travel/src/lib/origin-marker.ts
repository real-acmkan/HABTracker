import {
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader
} from 'three';

import ORIGIN_ICON_SVG from 'bundle-text:../../public/images/origin-icon.svg';
import ORIGIN_ICON_TOP_SVG from 'bundle-text:../../public/images/origin-icon-top.svg';

type OriginMarkerProps = {
  color?: number | string | Color;
  size?: number;
  heading?: number;
  tilt?: number;
  zoom?: number;
  baseZoom?: number;
};

enum IconType {
  default,
  top
}

const textureLoader = new TextureLoader();

export default class OriginMarker extends Group {
  private readonly originMarker: Mesh;
  private readonly originMarkerTop: Mesh;
  private lastProps: OriginMarkerProps = {};

  constructor(props: OriginMarkerProps) {
    super();

    this.originMarker = new Mesh(
      new PlaneGeometry(),
      new MeshBasicMaterial({
        alphaTest: 0.5,
        transparent: true
      })
    );
    this.originMarker.geometry.translate(0, 0.5, 0);

    this.originMarkerTop = new Mesh(
      new PlaneGeometry(),
      new MeshBasicMaterial({
        alphaTest: 0.5,
        transparent: true
      })
    );
    this.originMarkerTop.geometry.rotateX(-Math.PI / 2);

    this.add(this.originMarker, this.originMarkerTop);
    this.update(props);
  }

  update(props: OriginMarkerProps) {
    let {color, heading, tilt, size, zoom, baseZoom} = props;

    if (color !== undefined && color !== this.lastProps.color) {
      (<MeshBasicMaterial>this.originMarker.material).map = textureLoader.load(
        getSvgIconDataUrl(IconType.default, color)
      );
      (<MeshBasicMaterial>this.originMarkerTop.material).map =
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

const tmpColor = new Color();

function getSvgIconDataUrl(type: IconType, color: number | string | Color) {
  const svg = type === IconType.default ? ORIGIN_ICON_SVG : ORIGIN_ICON_TOP_SVG;

  tmpColor.set(color);

  return (
    'data:image/svg+xml;base64,' +
    btoa(svg.replace(/#000000/g, '#' + tmpColor.getHexString()))
  );
}
