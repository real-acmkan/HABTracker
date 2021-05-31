"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPagesContent = void 0;
const create_flight_route_1 = require("./create-flight-route");
const create_taxi_route_1 = require("./create-taxi-route");
const create_hotels_1 = require("./create-hotels");
const add_model_credits_1 = require("./add-model-credits");
const createPagesContent = (pageContent) => {
    const pageName = pageContent[0];
    const { travelInfo, attribution } = pageContent[1];
    const page = document.querySelector(`#${pageName}`);
    const travelDetails = document.createElement('div');
    const additionalInfoContainer = document.createElement('div');
    travelDetails.className = 'travel-details';
    additionalInfoContainer.className = 'additional-info';
    switch (pageContent[0]) {
        case 'flights':
            create_flight_route_1.createFlightRoute(pageContent[1], travelDetails);
            break;
        case 'taxis':
            create_taxi_route_1.createTaxiRoute(pageContent[1], travelDetails);
            break;
        case 'hotels':
            create_hotels_1.createHotels(pageContent[1], travelDetails);
            break;
    }
    for (let i = 0; i < 4; i++) {
        const placeholderContainer = document.createElement('div');
        const placeholderCircle = document.createElement('div');
        const placeholderBox = document.createElement('div');
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
        const info = document.createElement('div');
        info.className = 'info';
        page.appendChild(info);
        for (let value of Object.values(travelInfo)) {
            const content = document.createElement('span');
            content.innerText = String(value);
            info.appendChild(content);
        }
    }
    page.appendChild(additionalInfoContainer);
    if (attribution) {
        const attributionContainer = document.createElement('div');
        attributionContainer.className = 'attribution-container';
        add_model_credits_1.default(attribution, attributionContainer);
        page.appendChild(attributionContainer);
    }
};
exports.createPagesContent = createPagesContent;
