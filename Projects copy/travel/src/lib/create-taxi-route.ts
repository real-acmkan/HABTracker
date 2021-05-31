export const createTaxiRoute = (pageContent: any, route: HTMLElement) => {
  const {departure, arrival} = pageContent;
  const startContainer = <HTMLElement>document.createElement('div');
  const endContainer = <HTMLElement>document.createElement('div');
  const startAddress = <HTMLElement>document.createElement('div');
  const endAddress = <HTMLElement>document.createElement('div');
  const startCity = <HTMLElement>document.createElement('span');
  const startStreet = <HTMLElement>document.createElement('span');
  const endCity = <HTMLElement>document.createElement('span');
  const endStreet = <HTMLElement>document.createElement('span');
  const endIcon = document.createElement('mwc-icon');
  const startIcon = document.createElement('mwc-icon');

  route.className = 'taxi-route';
  startIcon.className = 'place-icon';
  startIcon.innerHTML = 'place';
  endIcon.className = 'place-icon';
  endIcon.innerHTML = 'place';

  startAddress.className = 'address';
  endAddress.className = 'address';
  startContainer.className = 'address-container';
  endContainer.className = 'address-container';

  startCity.innerText = departure.city;
  endCity.innerText = arrival.city;
  startStreet.innerText = departure.address;
  endStreet.innerText = arrival.address;

  route.appendChild(startContainer);
  route.appendChild(endContainer);

  startContainer.appendChild(startIcon);
  startContainer.appendChild(startAddress);
  startAddress.appendChild(startCity);
  startAddress.appendChild(startStreet);

  endContainer.appendChild(endIcon);
  endContainer.appendChild(endAddress);
  endAddress.appendChild(endCity);
  endAddress.appendChild(endStreet);
};
