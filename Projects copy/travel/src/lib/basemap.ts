import {loadMapsApi} from './load-maps-api';
import {MAP_ID, MAPS_API_KEY, MAPS_API_VERSION} from '../config';
import {
  CameraAnimation,
  LinearAnimation,
  OrbitAnimation
} from '../../../oobe/src/lib/map/camera-animation';

export interface MapOverlayInterface {
  setMap(map: google.maps.Map | null): void;
}

export interface BasemapOptions {
  initialViewport: google.maps.Camera;
}

export class Basemap {
  public readonly mapReady: Promise<void>;

  private readonly container: Element;
  private map: google.maps.Map | null = null;
  private camera: google.maps.Camera = {};

  constructor(container: Element, mapOptions: BasemapOptions) {
    this.container = container;

    const mapsApiLoaded = loadMapsApi({
      v: MAPS_API_VERSION,
      key: MAPS_API_KEY,
      map_ids: MAP_ID,
      libraries: 'places'
    });

    Object.assign(this.camera, mapOptions.initialViewport);

    this.mapReady = mapsApiLoaded.then(() => this.initMap());
  }

  public getMapInstance(): google.maps.Map {
    if (!this.map) {
      throw new Error(
        'Basemap.getMapInstance() called before map initialized.'
      );
    }

    return this.map;
  }

  public setCamera(camera: google.maps.Camera): void {
    Object.assign(this.camera, camera);

    if (this.map) {
      this.map.moveCamera(this.camera);
    }
  }

  public animateOrbit(degreesPerSecond: number): CameraAnimation {
    const animation = new OrbitAnimation(this);
    animation.initialHeading = this.map!.getHeading()!;
    animation.degreesPerSecond = degreesPerSecond;

    animation.play();

    return animation;
  }

  public animateToLinear(
    target: google.maps.Camera,
    duration: number,
    easing: (t: number) => number = t => t
  ): CameraAnimation {
    const animation = new LinearAnimation(this);
    animation.from = {...this.camera};
    animation.to = target;
    animation.duration = duration;
    animation.easing = easing;

    animation.play();

    return animation;
  }

  /**
   * Initializes the map in `this.container`.
   * @return A promise signaling when the map is fully loaded and initial tiles are rendered.
   */
  private initMap(): void {
    const {zoom, center, heading, tilt} = this.camera;
    this.map = new google.maps.Map(this.container, {
      mapId: MAP_ID,
      disableDefaultUI: true,
      useStaticMap: true,
      backgroundColor: 'transparent',
      gestureHandling: 'greedy',
      zoom,
      center,
      heading,
      tilt
    });

    //@ts-ignore
    window.map = this.map;
  }
}
