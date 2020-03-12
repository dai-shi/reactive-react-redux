/* eslint-disable @typescript-eslint/ban-ts-ignore */

import {
  useCallback,
  // @ts-ignore
  useMutableSource,
  useRef,
} from 'react';
import {
  Action as ReduxAction,
  Store,
} from 'redux';
import {
  createDeepProxy,
  isDeepChanged,
  MODE_ASSUME_UNCHANGED_IF_UNAFFECTED,
  MODE_IGNORE_REF_EQUALITY,
  MODE_ASSUME_UNCHANGED_IF_UNAFFECTED_IN_DEEP,
} from 'proxy-compare';

import { PatchedStore, subscribe } from './patchStore';
import { useIsomorphicLayoutEffect, useAffectedDebugValue } from './utils';

const MODE_ALWAYS_ASSUME_CHANGED_IF_UNAFFECTED = 0;
const MODE_ALWAYS_ASSUME_UNCHANGED_IF_UNAFFECTED = (
  MODE_ASSUME_UNCHANGED_IF_UNAFFECTED | MODE_ASSUME_UNCHANGED_IF_UNAFFECTED_IN_DEEP
);
const MODE_MUTABLE_ROOT_STATE = MODE_IGNORE_REF_EQUALITY; // only for root
const MODE_DEFAULT = MODE_ASSUME_UNCHANGED_IF_UNAFFECTED; // only for root

type Opts = any; // TODO types

/**
 * useTrackedState hook
 *
 * It return the Redux state wrapped by Proxy,
 * and the state prperty access is tracked.
 * It will only re-render if accessed properties are changed.
 *
 * @example
 * import { useTrackedState } from 'reactive-react-redux';
 *
 * const Component = () => {
 *   const state = useTrackedState(store);
 *   ...
 * };
 */
export const useTrackedState = <State, Action extends ReduxAction<any>>(
  patchedStore: PatchedStore<State, Action>,
  opts: Opts = {},
) => {
  const { mutableSource } = patchedStore;
  const affected = new WeakMap();
  const lastTracked = useRef<any>();
  const getSnapshot = useCallback((store: Store<State, Action>) => {
    const nextState = store.getState();
    const lastTrackedCurrent = lastTracked.current;
    if (lastTrackedCurrent && (lastTrackedCurrent.state === nextState
      || !isDeepChanged(
        lastTrackedCurrent.state,
        nextState,
        lastTrackedCurrent.affected,
        lastTrackedCurrent.cache,
        lastTrackedCurrent.mode,
      ))) {
      // not changed
      return lastTrackedCurrent.state;
    }
    return nextState;
  }, []);
  const state: State = useMutableSource(mutableSource, getSnapshot, subscribe);
  useIsomorphicLayoutEffect(() => {
    lastTracked.current = {
      state,
      affected,
      cache: new WeakMap(),
      /* eslint-disable no-nested-ternary, indent, @typescript-eslint/indent */
      /* eslint-disable no-nested-ternary, indent */
      mode:
      opts.unstable_forceUpdateForStateChange ? MODE_ALWAYS_ASSUME_CHANGED_IF_UNAFFECTED
      : opts.unstable_ignoreIntermediateObjectUsage ? MODE_ALWAYS_ASSUME_UNCHANGED_IF_UNAFFECTED
      : opts.unstable_ignoreStateEquality ? MODE_MUTABLE_ROOT_STATE
      : /* default */ MODE_DEFAULT,
      /* eslint-enable no-nested-ternary, indent */
    };
  });
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAffectedDebugValue(state, affected);
  }
  const proxyCache = useRef(new WeakMap()); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache.current);
};
