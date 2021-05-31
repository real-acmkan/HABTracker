"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (photo, page) => {
    if (photo.attribution) {
        const attributionContainer = document.createElement('div');
        attributionContainer.className = 'attribution-container';
        photo.attribution.forEach(attribution => {
            const creditElement = document.createElement('div');
            creditElement.innerHTML = 'Image by ' + attribution;
            const anchorChild = creditElement.firstElementChild;
            anchorChild.className = 'attribution-link';
            anchorChild.target = '_blank';
            attributionContainer.appendChild(creditElement);
        });
        page.appendChild(attributionContainer);
    }
};
