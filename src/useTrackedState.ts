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
import { Action as ReduxAction, Store } from 'redux';
import { createDeepProxy, isDeepChanged } from 'proxy-compare';

import { PatchedStore, subscribe } from './patchStore';
import { useAffectedDebugValue } from './utils';

const isSSR = typeof window === 'undefined'
  || /ServerSideRendering/.test(window.navigator && window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

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
        )
      ) {
        // not changed
        return prevState.current;
      }
      prevState.current = nextState;
      return nextState;
    };
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const state: State = useMutableSource(mutableSource, getSnapshot, subscribe);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAffectedDebugValue(state, affected);
  }
  const proxyCache = useMemo(() => new WeakMap(), []); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache);
};
