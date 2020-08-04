/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  // @ts-ignore
  unstable_createMutableSource as createMutableSource,
} from 'react';
import {
  Action as ReduxAction,
  Store,
} from 'redux';

export type PatchedStore<State, Action extends ReduxAction<any>> = {
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
export const patchStore = <State, Action extends ReduxAction<any>>(
  store: Store<State, Action>,
) => {
  const mutableSource = createMutableSource(store, () => store.getState());
  (store as PatchedStore<State, Action>).mutableSource = mutableSource;
  return store as PatchedStore<State, Action>;
};

export const subscribe = <State, Action extends ReduxAction<any>>(
  store: Store<State, Action>,
  callback: () => void,
) => {
  const unsubscribe = store.subscribe(callback);
  return unsubscribe;
};
