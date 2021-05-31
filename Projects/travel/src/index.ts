import {App} from './lib/app';
import initUi from './lib/init-ui';

import {IntroPage} from './page/intro';
import {FlightsPage} from './page/flights';
import {TaxisPage} from './page/taxis';
import {HotelsPage} from './page/hotels';
import {RestaurantsPage} from './page/restaurants';
import {SightsPage} from './page/sights';
import appendDynamicHotelData from './lib/append-dynamic-hotel-data';
import store from '../../oobe/src/lib/store';
import initUrlHandler from '../../oobe/src/lib/ui/url-handler';

async function main() {
  initUrlHandler(store);
  initUi(store);

  const app = new App();

  app.registerPage('intro', IntroPage);
  app.registerPage('flights', FlightsPage);
  app.registerPage('taxis', TaxisPage);
  app.registerPage('hotels', HotelsPage);
  app.registerPage('restaurants', RestaurantsPage);
  app.registerPage('sights', SightsPage);

  // wait until app is usable (waiting for maps-API to load)
  await app.ready;
  document.querySelector<HTMLElement>('#loading-bar')!.style.display = 'none';

  appendDynamicHotelData(app.placesService!);

  store.subscribe(state => {
    app.update(state);
  });
}

main().catch(err => {
  console.error('unexpected error in main(): ', err);
});

export {};
