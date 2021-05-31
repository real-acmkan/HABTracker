"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(attribution, container) {
    attribution.forEach((entity) => {
        const { model, author, license } = entity;
        const credit = document.createElement('div');
        container.appendChild(credit);
        credit.innerHTML = `<a class="attribution-link" target="_blank" href=${model.link}>${model.name}</a> by ${author} is licensed under <a class="attribution-link" target="_blank" href=${license.link}>${license.name}</a>`;
    });
}
exports.default = default_1;
