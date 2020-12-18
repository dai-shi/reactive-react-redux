/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  useCallback,
  // @ts-ignore
  unstable_useMutableSource as useMutableSource,
} from 'react';
import {
  Action as ReduxAction,
  Store,
} from 'redux';

import { PatchedStore, subscribe } from './patchStore';

/**
 * useSelector hook
 *
 * selector has to be stable. Either define it outside render
 * or use useCallback if selector uses props.
 *
 * @example
 * import { useCallback } from 'react';
 * import { useSelector } from 'reactive-react-redux';
 *
 * const Component = ({ count }) => {
 *   const isBigger = useSelector(store, useCallack(state => state.count > count, [count]));
 *   ...
 * };
 */
export const useSelector = <State, Action extends ReduxAction<any>, Selected>(
  patchedStore: PatchedStore<State, Action>,
  selector: (state: State) => Selected,
) => {
  const { mutableSource } = patchedStore;
  const getSnapshot = useCallback((store: Store<State, Action>) => (
    selector(store.getState())
  ), [selector]);
  const selected: Selected = useMutableSource(mutableSource, getSnapshot, subscribe);
  return selected;
};
