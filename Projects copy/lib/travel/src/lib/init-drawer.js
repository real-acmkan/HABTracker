"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDrawer = void 0;
const initDrawer = () => {
    const infoButton = document.querySelector('#fab-info');
    const drawer = document.querySelectorAll('mwc-drawer')[0];
    const closeDrawerButton = (document.querySelector('#close-drawer-button'));
    if (drawer) {
        infoButton.onclick = () => {
            drawer.open = !drawer.open;
        };
        closeDrawerButton.onclick = () => {
            drawer.open = !drawer.open;
        };
    }
};
exports.initDrawer = initDrawer;
