const getTravelContent = (route: HTMLElement, content: Object) => {
  const flightData = <HTMLElement>document.createElement('div');
  flightData.className = 'flight-data';

  for (let [key, value] of Object.entries(content)) {
    const content = document.createElement('span');
    content.className = key;
    content.innerText = value;

    flightData.appendChild(content);
  }
  route.appendChild(flightData);
};

export const createFlightRoute = (pageContent: any, route: HTMLElement) => {
  const {departure, arrival, totalTime} = pageContent;

  const totalTimeContainer = <HTMLElement>document.createElement('div');
  totalTimeContainer.className = 'travel-time';

  getTravelContent(route, departure);

  const icon = document.createElement('mwc-icon');
  const line1 = document.createElement('mwc-icon');
  const line2 = document.createElement('mwc-icon');
  const time = document.createElement('p');

  icon.className = 'plane-icon';
  icon.innerHTML = 'flight';
  line1.innerHTML = 'horizontal_rule';
  line2.innerHTML = 'horizontal_rule';
  time.innerText = totalTime;

  totalTimeContainer.appendChild(line1);
  totalTimeContainer.appendChild(icon);
  totalTimeContainer.appendChild(line2);
  totalTimeContainer.appendChild(time);

  route.appendChild(totalTimeContainer);

  getTravelContent(route, arrival);
};
