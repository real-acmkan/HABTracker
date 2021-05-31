"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easeInOutQuint = exports.easeInSine = exports.easeInOutCubic = exports.easeInOutQuad = void 0;
// https://easings.net/
function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
exports.easeInOutQuad = easeInOutQuad;
function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
exports.easeInOutCubic = easeInOutCubic;
function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2);
}
exports.easeInSine = easeInSine;
function easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}
exports.easeInOutQuint = easeInOutQuint;
