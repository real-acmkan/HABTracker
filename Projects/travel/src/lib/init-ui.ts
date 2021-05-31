import {initPagination} from './init-pagination';
import {initDrawer} from './init-drawer';
import {createPagesContent} from './pages-content';
import {pagesContent} from '../../public/data/pages-content';
import type {Store} from '../../../oobe/src/lib/store';

export default (store: Store) => {
  initPagination(store);
  initDrawer();

  if (store.getState().currentPage !== 'intro') {
    document.querySelector<HTMLElement>('.pages')!.style.display = '';
    document.querySelector<HTMLElement>('.navigation')!.style.display = '';
  }

  for (const pageContent of Object.entries(pagesContent)) {
    createPagesContent(pageContent);
  }
};
