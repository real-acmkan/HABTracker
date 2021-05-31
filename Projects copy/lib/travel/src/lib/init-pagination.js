"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPagination = void 0;
const config_1 = require("../config");
const store_1 = require("../../../oobe/src/lib/store");
const initPagination = (store) => {
    const navIcons = document.querySelectorAll('.nav-icon');
    const backButton = document.querySelector('#back-button');
    const nextButton = document.querySelector('#next-button');
    // side panel navigation
    store.subscribe(state => {
        navIcons.forEach(navIcon => {
            if (state.currentPage === `${navIcon.id}s`) {
                navIcon.classList.add('nav-icon--active');
            }
            else {
                navIcon.classList.remove('nav-icon--active');
            }
        });
        const lastId = config_1.PAGE_IDS.length - 1;
        if (state.currentPage === config_1.PAGE_IDS[0]) {
            backButton.disabled = true;
            nextButton.disabled = false;
        }
        else if (state.currentPage === config_1.PAGE_IDS[lastId]) {
            nextButton.disabled = true;
            backButton.disabled = false;
        }
        else {
            backButton.disabled = false;
            nextButton.disabled = false;
        }
    });
    navIcons.forEach(navIcon => {
        navIcon.addEventListener('click', () => {
            store_1.setCurrentPage(`${navIcon.id}s`);
        });
    });
    // pagination
    backButton.addEventListener('click', () => {
        store_1.goToPreviousPage();
    });
    nextButton.addEventListener('click', () => {
        store_1.goToNextPage();
    });
};
exports.initPagination = initPagination;
