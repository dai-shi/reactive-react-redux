import { Action as ReduxAction, Store } from 'redux';
export declare type PatchedStore<State, Action extends ReduxAction<any>> = {
    mutableSource: any;
} & Store<State, Action>;
/**
 * patch Redux store for React
 *
 * @example
 * import { createStore } from 'redux';
 * import { patchStore } from 'reactive-react-redux';
 *
 * const reducer = ...;
 * const store = patchStore(createStore(reducer));
 */
export declare const patchStore: <State, Action extends ReduxAction<any>>(store: Store<State, Action>) => PatchedStore<State, Action>;
export declare const subscribe: <State, Action extends ReduxAction<any>>(store: Store<State, Action>, callback: () => void) => import("redux").Unsubscribe;
