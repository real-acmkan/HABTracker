import {setCurrentPage, Store} from '../store';
/**
 * Updates the application state from hashchange-events and updates the URL
 * when the page is changed internally.
 */
export default function init(store: Store) {
  const initialPageId = document.location.hash.slice(1) || 'intro';

  setCurrentPage(initialPageId);

  window.addEventListener('hashchange', ev => {
    const url = new URL(ev.newURL);
    const pageId = url.hash.slice(1);

    setCurrentPage(pageId);
  });

  store.subscribe(state => {
    const newHash = `#${state.currentPage}`;

    if (location.hash !== newHash) {
      // @ts-ignore this is perfectly fine, but typescript will complain
      window.location = newHash;
    }
  });
}
