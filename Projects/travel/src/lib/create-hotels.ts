import ADDRESS_MARKER from 'url:../../public/images/hotels-ui-green-marker.svg';

// we will render static pages content to the dom
// and prepare dom nodes for later requests with places api
export const createHotels = (pageContent: any, travelDetails: HTMLElement) => {
  const {dates, accomodationType} = pageContent;
  const {checkIn, checkOut} = dates;

  const hotelsContent = document.createElement('div');
  hotelsContent.className = 'hotels-content';
  travelDetails.appendChild(hotelsContent);

  const header = document.createElement('div');
  header.className = 'hotels-header';
  hotelsContent.appendChild(header);

  const image = document.createElement('img');
  image.className = 'hotels-image';
  header.appendChild(image);

  const headerContent = document.createElement('div');
  headerContent.className = 'hotels-header-content';
  header.appendChild(headerContent);

  const headerContentTitle = document.createElement('div');
  headerContentTitle.className = 'hotels-header-content-title';
  headerContent.appendChild(headerContentTitle);

  const headerContentDescription = document.createElement('div');
  headerContentDescription.className = 'hotels-header-content-description';
  headerContent.appendChild(headerContentDescription);

  const ratingElement = document.createElement('span');
  ratingElement.className = 'hotels-rating';
  headerContentDescription.appendChild(ratingElement);

  const starsContainer = document.createElement('div');
  starsContainer.className = 'hotels-stars-container';
  headerContentDescription.appendChild(starsContainer);

  const numberReviewElement = document.createElement('span');
  numberReviewElement.className = 'hotels-reviews';
  headerContentDescription.appendChild(numberReviewElement);

  const headerSubContent = document.createElement('div');
  headerSubContent.className = 'hotels-header-subcontent';
  headerContent.appendChild(headerSubContent);

  const addressMarker = document.createElement('img');
  addressMarker.className = 'hotels-address-marker';
  addressMarker.src = ADDRESS_MARKER;
  headerSubContent.appendChild(addressMarker);

  const addressElement = document.createElement('span');
  addressElement.className = 'hotels-address-element';
  headerSubContent.appendChild(addressElement);

  const travel = document.createElement('div');
  travel.className = 'hotels-travel';
  hotelsContent.appendChild(travel);

  const checkInElement = document.createElement('div');
  checkInElement.className = 'hotels-travel-check';
  travel.appendChild(checkInElement);

  const checkInKey = document.createElement('div');
  checkInKey.className = 'hotels-key';
  checkInKey.innerText = 'Check in:';
  checkInElement.appendChild(checkInKey);

  const checkInValue = document.createElement('div');
  checkInValue.className = 'hotels-value';
  checkInValue.innerText = checkIn;
  checkInElement.appendChild(checkInValue);

  const checkOutElement = document.createElement('div');
  checkOutElement.className = 'hotels';
  travel.appendChild(checkOutElement);

  const checkOutKey = document.createElement('div');
  checkOutKey.className = 'hotels-key';
  checkOutKey.innerText = 'Check out:';
  checkOutElement.appendChild(checkOutKey);

  const checkOutValue = document.createElement('div');
  checkOutValue.className = 'hotels-value';
  checkOutValue.innerText = checkOut;
  checkOutElement.appendChild(checkOutValue);

  const accomodation = document.createElement('div');
  accomodation.className = 'hotels-accomodation';
  hotelsContent.appendChild(accomodation);

  const accomodationKey = document.createElement('div');
  accomodationKey.innerText = 'Type of accomodation:';
  accomodationKey.className = 'hotels-key';
  accomodation.appendChild(accomodationKey);

  const accomodationValue = document.createElement('div');
  accomodationValue.innerText = accomodationType;
  accomodationValue.className = 'hotels-value';
  accomodation.appendChild(accomodationValue);
};
