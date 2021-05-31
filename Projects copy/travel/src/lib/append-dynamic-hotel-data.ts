import appendStarsRating from '../lib/append-stars-rating';
import addPlacesImageCredits from './add-places-image-credits';

const RITZ_PLACE_ID = 'ChIJV8gP0ykFdkgRFEAEHoE1YVk';

export default function (service: google.maps.places.PlacesService) {
  const request = {
    placeId: RITZ_PLACE_ID,
    fields: [
      'name',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'photos'
    ]
  };

  service.getDetails(request, (place, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK) return;
    const {name, rating, user_ratings_total, formatted_address, photos} =
      place!;

    const firstPhoto = photos![0];
    document.querySelector<HTMLImageElement>('.hotels-image')!.src =
      firstPhoto.getUrl();

    addPlacesImageCredits(
      {url: firstPhoto.getUrl(), attribution: firstPhoto.html_attributions},
      <HTMLElement>document.querySelector(`#hotels`)
    );

    document.querySelector<HTMLElement>(
      '.hotels-header-content-title'
    )!.innerText = name!;

    document.querySelector<HTMLElement>('.hotels-rating')!.innerText =
      rating!.toString();

    appendStarsRating(
      document.querySelector<HTMLElement>('.hotels-stars-container')!,
      rating!
    );

    document.querySelector<HTMLElement>(
      '.hotels-reviews'
    )!.innerText = `${new Intl.NumberFormat().format(
      user_ratings_total!
    )} reviews`;

    document.querySelector<HTMLElement>('.hotels-address-element')!.innerText =
      formatted_address!;
  });
}
