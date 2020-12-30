/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  // @ts-ignore
  unstable_useMutableSource as useMutableSource,
} from 'react';
import { Action as ReduxAction, Store } from 'redux';
import { createDeepProxy, isDeepChanged } from 'proxy-compare';

import { PatchedStore } from './patchStore';
import { useAffectedDebugValue } from './utils';

const isSSR = typeof window === 'undefined'
  || /ServerSideRendering/.test(window.navigator && window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

const getSnapshot = <State, Action extends ReduxAction<any>>(
  store: Store<State, Action>,
) => store.getState();

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
) => {
  const { mutableSource } = patchedStore;
  const [version, forceUpdate] = useReducer((c) => c + 1, 0);
  const affected = new WeakMap();
  const lastAffected = useRef<WeakMap<Record<string, unknown>, unknown>>();
  const prevState = useRef<State>();
  const lastState = useRef<State>();
  useIsomorphicLayoutEffect(() => {
    prevState.current = patchedStore.getState();
    lastState.current = patchedStore.getState();
  }, [patchedStore]);
  useIsomorphicLayoutEffect(() => {
    lastAffected.current = affected;
    if (prevState.current !== lastState.current
      && isDeepChanged(
        prevState.current,
        lastState.current,
        affected,
        new WeakMap(),
      )) {
      prevState.current = lastState.current;
      forceUpdate();
    }
  });
  const sub = useCallback((store: Store<State, Action>, cb: () => void) => store.subscribe(() => {
    const nextState = store.getState();
    lastState.current = nextState;
    if (prevState.current
      && lastAffected.current
      && !isDeepChanged(
        prevState.current,
        nextState,
        lastAffected.current,
        new WeakMap(),
      )
    ) {
      // not changed
      return;
    }
    prevState.current = nextState;
    cb();
  }), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const state: State = useMutableSource(mutableSource, getSnapshot, sub);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAffectedDebugValue(state, affected);
  }
  const proxyCache = useMemo(() => new WeakMap(), []); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache);
};
