export interface AppState {
    currentPage: string;
}
declare type ListenerFunction = (state: AppState) => void;
declare type UnsubscribeFunction = () => void;
export interface Store {
    getState(): AppState;
    subscribe(fn: ListenerFunction): UnsubscribeFunction;
}
declare const store: Store;
export default store;
export declare function setCurrentPage(pageId: string): void;
export declare function goToPreviousPage(): void;
export declare function goToNextPage(): void;
