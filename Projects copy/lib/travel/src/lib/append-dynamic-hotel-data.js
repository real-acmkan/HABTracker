"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const append_stars_rating_1 = require("../lib/append-stars-rating");
const add_places_image_credits_1 = require("./add-places-image-credits");
const RITZ_PLACE_ID = 'ChIJV8gP0ykFdkgRFEAEHoE1YVk';
function default_1(service) {
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
        if (status !== google.maps.places.PlacesServiceStatus.OK)
            return;
        const { name, rating, user_ratings_total, formatted_address, photos } = place;
        const firstPhoto = photos[0];
        document.querySelector('.hotels-image').src =
            firstPhoto.getUrl();
        add_places_image_credits_1.default({ url: firstPhoto.getUrl(), attribution: firstPhoto.html_attributions }, document.querySelector(`#hotels`));
        document.querySelector('.hotels-header-content-title').innerText = name;
        document.querySelector('.hotels-rating').innerText =
            rating.toString();
        append_stars_rating_1.default(document.querySelector('.hotels-stars-container'), rating);
        document.querySelector('.hotels-reviews').innerText = `${new Intl.NumberFormat().format(user_ratings_total)} reviews`;
        document.querySelector('.hotels-address-element').innerText =
            formatted_address;
    });
}
exports.default = default_1;
