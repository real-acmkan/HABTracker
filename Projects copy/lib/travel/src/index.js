"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./lib/app");
const init_ui_1 = require("./lib/init-ui");
const intro_1 = require("./page/intro");
const flights_1 = require("./page/flights");
const taxis_1 = require("./page/taxis");
const hotels_1 = require("./page/hotels");
const restaurants_1 = require("./page/restaurants");
const sights_1 = require("./page/sights");
const append_dynamic_hotel_data_1 = require("./lib/append-dynamic-hotel-data");
const store_1 = require("../../oobe/src/lib/store");
const url_handler_1 = require("../../oobe/src/lib/ui/url-handler");
async function main() {
    url_handler_1.default(store_1.default);
    init_ui_1.default(store_1.default);
    const app = new app_1.App();
    app.registerPage('intro', intro_1.IntroPage);
    app.registerPage('flights', flights_1.FlightsPage);
    app.registerPage('taxis', taxis_1.TaxisPage);
    app.registerPage('hotels', hotels_1.HotelsPage);
    app.registerPage('restaurants', restaurants_1.RestaurantsPage);
    app.registerPage('sights', sights_1.SightsPage);
    // wait until app is usable (waiting for maps-API to load)
    await app.ready;
    document.querySelector('#loading-bar').style.display = 'none';
    append_dynamic_hotel_data_1.default(app.placesService);
    store_1.default.subscribe(state => {
        app.update(state);
    });
}
main().catch(err => {
    console.error('unexpected error in main(): ', err);
});
