/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  useMemo,
  // @ts-ignore
  unstable_useMutableSource as useMutableSource,
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
import { useAffectedDebugValue } from './utils';

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
  const deepChangedMode = (
    /* eslint-disable no-nested-ternary, indent, no-multi-spaces */
      opts.unstable_forceUpdateForStateChange     ? MODE_ALWAYS_ASSUME_CHANGED_IF_UNAFFECTED
    : opts.unstable_ignoreIntermediateObjectUsage ? MODE_ALWAYS_ASSUME_UNCHANGED_IF_UNAFFECTED
    : opts.unstable_ignoreStateEquality           ? MODE_MUTABLE_ROOT_STATE
    : /* default */                                 MODE_DEFAULT
    /* eslint-enable no-nested-ternary, indent, no-multi-spaces */
  );
  const getSnapshot = useMemo(() => {
    let prevState: State | null = null;
    const deepChangedCache = new WeakMap();
    return (store: Store<State, Action>) => {
      const nextState = store.getState();
      if (prevState !== null && prevState !== nextState && !isDeepChanged(
        prevState,
        nextState,
        affected,
        deepChangedCache,
        deepChangedMode,
      )) {
        // not changed
        return prevState;
      }
      prevState = nextState;
      return nextState;
    };
  }, [affected, deepChangedMode]);
  const state: State = useMutableSource(mutableSource, getSnapshot, subscribe);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAffectedDebugValue(state, affected);
  }
  const proxyCache = useMemo(() => new WeakMap(), []); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache);
};
