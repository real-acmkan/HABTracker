import {createFlightRoute} from './create-flight-route';
import {createTaxiRoute} from './create-taxi-route';
import {createHotels} from './create-hotels';
import addModelCredits from './add-model-credits';

export const createPagesContent = (pageContent: any) => {
  const pageName = pageContent[0];
  const {travelInfo, attribution} = pageContent[1];

  const page = <HTMLElement>document.querySelector(`#${pageName}`);
  const travelDetails = <HTMLElement>document.createElement('div');
  const additionalInfoContainer = <HTMLElement>document.createElement('div');

  travelDetails.className = 'travel-details';
  additionalInfoContainer.className = 'additional-info';

  switch (pageContent[0]) {
    case 'flights':
      createFlightRoute(pageContent[1], travelDetails);
      break;
    case 'taxis':
      createTaxiRoute(pageContent[1], travelDetails);
      break;
    case 'hotels':
      createHotels(pageContent[1], travelDetails);
      break;
  }

  for (let i = 0; i < 4; i++) {
    const placeholderContainer = <HTMLElement>document.createElement('div');
    const placeholderCircle = <HTMLElement>document.createElement('div');
    const placeholderBox = <HTMLElement>document.createElement('div');

    placeholderContainer.className = 'placeholder-container';
    placeholderCircle.className = 'placeholder-circle';
    placeholderBox.className = 'placeholder-box';
    placeholderBox.style.width = `${120 + Math.random() * 50}px`;

    additionalInfoContainer.appendChild(placeholderContainer);
    placeholderContainer.appendChild(placeholderCircle);
    placeholderContainer.appendChild(placeholderBox);
  }

  page.appendChild(travelDetails);

  if (travelInfo) {
    const info = <HTMLElement>document.createElement('div');
    info.className = 'info';
    page.appendChild(info);

    for (let value of Object.values(travelInfo)) {
      const content = <HTMLSpanElement>document.createElement('span');
      content.innerText = String(value);
      info.appendChild(content);
    }
  }
  page.appendChild(additionalInfoContainer);

  if (attribution) {
    const attributionContainer = document.createElement('div');
    attributionContainer.className = 'attribution-container';
    addModelCredits(attribution, attributionContainer);
    page.appendChild(attributionContainer);
  }
};
