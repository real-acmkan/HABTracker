import {PAGE_IDS} from '../config';
import {
  goToNextPage,
  goToPreviousPage,
  setCurrentPage,
  Store
} from '../../../oobe/src/lib/store';

export const initPagination = (store: Store) => {
  const navIcons = document.querySelectorAll<HTMLAnchorElement>('.nav-icon');
  const backButton = <HTMLButtonElement>document.querySelector('#back-button');
  const nextButton = <HTMLButtonElement>document.querySelector('#next-button');

  // side panel navigation
  store.subscribe(state => {
    navIcons.forEach(navIcon => {
      if (state.currentPage === `${navIcon.id}s`) {
        navIcon.classList.add('nav-icon--active');
      } else {
        navIcon.classList.remove('nav-icon--active');
      }
    });

    const lastId = PAGE_IDS.length - 1;

    if (state.currentPage === PAGE_IDS[0]) {
      backButton.disabled = true;
      nextButton.disabled = false;
    } else if (state.currentPage === PAGE_IDS[lastId]) {
      nextButton.disabled = true;
      backButton.disabled = false;
    } else {
      backButton.disabled = false;
      nextButton.disabled = false;
    }
  });

  navIcons.forEach(navIcon => {
    navIcon.addEventListener('click', () => {
      setCurrentPage(`${navIcon.id}s`);
    });
  });

  // pagination
  backButton.addEventListener('click', () => {
    goToPreviousPage();
  });

  nextButton.addEventListener('click', () => {
    goToNextPage();
  });
};
