import {PAGE_IDS} from '../config';

export interface AppState {
  currentPage: string;
}

type ListenerFunction = (state: AppState) => void;
type UnsubscribeFunction = () => void;

let state: AppState = {
  currentPage: 'intro'
};

const listeners: Set<ListenerFunction> = new Set();

// this is the only place where the state gets modified.
// Note that every change results in a new state-object.
// Should only be called by actions defined in this module.
function setState(newState: Partial<AppState>): void {
  state = {...state, ...newState};
  listeners.forEach(fn => fn(state));
}

export interface Store {
  getState(): AppState;
  subscribe(fn: ListenerFunction): UnsubscribeFunction;
}

const store: Store = {
  getState(): AppState {
    return state;
  },

  /**
   * Subscribes the given function for changes to the state.
   * As the intention is to keep some module informed about all changes
   * to the state, it will also immediately dispatch a change when subscribed.
   * @param fn
   */
  subscribe(fn: ListenerFunction): UnsubscribeFunction {
    listeners.add(fn);
    setTimeout(() => fn(state), 0);

    return () => void listeners.delete(fn);
  }
};
export default store;

// ---- "action" definitions

export function setCurrentPage(pageId: string) {
  setState({currentPage: pageId});
}

export function goToPreviousPage() {
  const {currentPage} = store.getState();
  const prevIndex = Math.max(0, PAGE_IDS.indexOf(currentPage) - 1);

  setCurrentPage(PAGE_IDS[prevIndex]);
}

export function goToNextPage() {
  const {currentPage} = store.getState();
  const nextIndex = Math.min(
    PAGE_IDS.length - 1,
    PAGE_IDS.indexOf(currentPage) + 1
  );

  setCurrentPage(PAGE_IDS[nextIndex]);
}

// ---- for debugging...

// @ts-ignore
window.actions = {setCurrentPage};
