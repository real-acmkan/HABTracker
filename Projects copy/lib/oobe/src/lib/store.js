"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goToNextPage = exports.goToPreviousPage = exports.setCurrentPage = void 0;
const config_1 = require("../config");
let state = {
    currentPage: 'intro'
};
const listeners = new Set();
// this is the only place where the state gets modified.
// Note that every change results in a new state-object.
// Should only be called by actions defined in this module.
function setState(newState) {
    state = { ...state, ...newState };
    listeners.forEach(fn => fn(state));
}
const store = {
    getState() {
        return state;
    },
    /**
     * Subscribes the given function for changes to the state.
     * As the intention is to keep some module informed about all changes
     * to the state, it will also immediately dispatch a change when subscribed.
     * @param fn
     */
    subscribe(fn) {
        listeners.add(fn);
        setTimeout(() => fn(state), 0);
        return () => void listeners.delete(fn);
    }
};
exports.default = store;
// ---- "action" definitions
function setCurrentPage(pageId) {
    setState({ currentPage: pageId });
}
exports.setCurrentPage = setCurrentPage;
function goToPreviousPage() {
    const { currentPage } = store.getState();
    const prevIndex = Math.max(0, config_1.PAGE_IDS.indexOf(currentPage) - 1);
    setCurrentPage(config_1.PAGE_IDS[prevIndex]);
}
exports.goToPreviousPage = goToPreviousPage;
function goToNextPage() {
    const { currentPage } = store.getState();
    const nextIndex = Math.min(config_1.PAGE_IDS.length - 1, config_1.PAGE_IDS.indexOf(currentPage) + 1);
    setCurrentPage(config_1.PAGE_IDS[nextIndex]);
}
exports.goToNextPage = goToNextPage;
// ---- for debugging...
// @ts-ignore
window.actions = { setCurrentPage };
