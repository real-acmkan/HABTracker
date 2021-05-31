import appendStarsRating from './append-stars-rating';
import type {Basemap} from './basemap';
import {easeInOutCubic} from './easings';
import type {Attraction} from '../page/sights';

export const createSightsContent = (
  data: Attraction[],
  basemap: Basemap,
  initialCamera: google.maps.Camera
) => {
  const sightsPanel = document.getElementById('sights');
  const sightsContainer = document.createElement('div');

  sightsContainer.className = 'sights-container';
  sightsPanel?.appendChild(sightsContainer);

  data.map((attraction: Attraction) => {
    const {place} = attraction;

    if (place && place.name && place.formatted_address) {
      const sightItem = document.createElement('div');
      const sightInfo = document.createElement('div');
      const sightRating = document.createElement('div');
      const stars = document.createElement('div');
      const reviews = document.createElement('p');
      const sightName = document.createElement('p');
      const sightAddress = document.createElement('p');

      if (place.photos && place.photos.length > 0) {
        const image = document.createElement('img');
        const photo = place.photos[0].getUrl();
        image.src = photo;
        image.className = 'sight-image';
        sightItem?.appendChild(image);
      }

      sightItem.className = 'sight-item';
      sightItem.id = place.name;
      reviews.className = 'infobox-reviews';
      sightInfo.className = 'sight-info';

      if (place.rating) {
        sightRating.className = 'infobox-rating';
        stars.innerText = place.rating.toString();
        stars.className = 'stars-container';

        appendStarsRating(stars, place.rating);

        sightRating.appendChild(stars);
        sightRating.appendChild(reviews);
      }

      sightName.innerText = place.name;
      sightAddress.innerText = place.formatted_address;

      if (place.user_ratings_total) {
        reviews.innerText = `${new Intl.NumberFormat().format(
          place.user_ratings_total
        )} reviews`;
      }

      let headingAlternator = false;
      const maxOffsetCenterError = 0.000001;

      sightItem.onclick = () => {
        const map = basemap.getMapInstance();

        const currCenter = map.getCenter()!;
        basemap.setCamera({
          center: currCenter,
          tilt: map.getTilt(),
          zoom: map.getZoom(),
          heading: map.getHeading()
        });
        const newCenter = {
          lat: place.geometry?.location?.lat()!,
          lng: place.geometry?.location?.lng()! + 0.0015 // a bit more space for the label
        };

        // dont animate if user clicks on same item twice
        if (
          Math.abs(currCenter.lat() - newCenter.lat) < maxOffsetCenterError &&
          Math.abs(currCenter.lng() - newCenter.lng) < maxOffsetCenterError
        )
          return;

        const currHeading = map.getHeading()!;
        const newHeading = currHeading + (headingAlternator ? 10 : -10);
        headingAlternator = !headingAlternator;

        const toCamera = {
          center: newCenter,
          heading: newHeading,
          tilt: initialCamera.tilt,
          zoom: initialCamera.zoom
        };

        basemap.animateToLinear(toCamera, 1000, easeInOutCubic);
      };

      sightsContainer?.appendChild(sightItem);
      sightItem?.appendChild(sightInfo);
      sightInfo?.appendChild(sightName);
      sightInfo?.appendChild(sightRating);
      sightInfo?.appendChild(sightAddress);
    }
  });
};
