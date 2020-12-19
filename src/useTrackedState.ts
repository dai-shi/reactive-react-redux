/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
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

const isSSR = typeof window === 'undefined'
  || /ServerSideRendering/.test(window.navigator && window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

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
  const deepChangedMode = (
    /* eslint-disable no-nested-ternary, indent, no-multi-spaces */
      opts.unstable_forceUpdateForStateChange     ? MODE_ALWAYS_ASSUME_CHANGED_IF_UNAFFECTED
    : opts.unstable_ignoreIntermediateObjectUsage ? MODE_ALWAYS_ASSUME_UNCHANGED_IF_UNAFFECTED
    : opts.unstable_ignoreStateEquality           ? MODE_MUTABLE_ROOT_STATE
    : /* default */                                 MODE_DEFAULT
    /* eslint-enable no-nested-ternary, indent, no-multi-spaces */
  );
  const [version, forceUpdate] = useReducer((c) => c + 1, 0);
  const affected = new WeakMap();
  const lastAffected = useRef<WeakMap<Record<string, unknown>, unknown>>();
  const prevState = useRef<State>();
  const lastState = useRef<State>();
  useIsomorphicLayoutEffect(() => {
    lastAffected.current = affected;
    if (prevState.current !== lastState.current
      && isDeepChanged(
        prevState.current,
        lastState.current,
        affected,
        new WeakMap(),
        deepChangedMode,
      )) {
      prevState.current = lastState.current;
      forceUpdate();
    }
  });
  const getSnapshot = useMemo(() => {
    const deepChangedCache = new WeakMap();
    return (store: Store<State, Action>) => {
      const nextState = store.getState();
      lastState.current = nextState;
      if (prevState.current
        && prevState.current !== nextState
        && lastAffected.current
        && !isDeepChanged(
          prevState.current,
          nextState,
          lastAffected.current,
          deepChangedCache,
          deepChangedMode,
        )
      ) {
        // not changed
        return prevState.current;
      }
      prevState.current = nextState;
      return nextState;
    };
  }, [version, deepChangedMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const state: State = useMutableSource(mutableSource, getSnapshot, subscribe);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAffectedDebugValue(state, affected);
  }
  const proxyCache = useMemo(() => new WeakMap(), []); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache);
};
