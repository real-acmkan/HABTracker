"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_pagination_1 = require("./init-pagination");
const init_drawer_1 = require("./init-drawer");
const pages_content_1 = require("./pages-content");
const pages_content_2 = require("../../public/data/pages-content");
exports.default = (store) => {
    init_pagination_1.initPagination(store);
    init_drawer_1.initDrawer();
    if (store.getState().currentPage !== 'intro') {
        document.querySelector('.pages').style.display = '';
        document.querySelector('.navigation').style.display = '';
    }
    for (const pageContent of Object.entries(pages_content_2.pagesContent)) {
        pages_content_1.createPagesContent(pageContent);
    }
};
