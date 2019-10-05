import {
  useContext,
  useEffect,
  useRef,
  useReducer,
} from 'react';

import { defaultContext } from './Provider';

import { useIsomorphicLayoutEffect } from './utils';

import { createDeepProxy, isDeepChanged } from './deepProxy';

export const useTrackedState = (opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const [, forceUpdate] = useReducer(c => c + 1, 0);
  const { state, subscribe } = useContext(customContext);
  const affected = new WeakMap();
  const lastTracked = useRef(null);
  useIsomorphicLayoutEffect(() => {
    lastTracked.current = {
      state,
      affected,
      cache: new WeakMap(),
      /* eslint-disable no-nested-ternary, indent, @typescript-eslint/indent */
      assumeChangedIfNotAffected:
        opts.unstable_forceUpdateForStateChange ? true
      : opts.unstable_ignoreIntermediateObjectUsage ? false
      : /* default */ null,
      /* eslint-enable no-nested-ternary, indent, @typescript-eslint/indent */
    };
  });
  useEffect(() => {
    const callback = (nextState) => {
      if (lastTracked.current.state === nextState
        || !isDeepChanged(
          lastTracked.current.state,
          nextState,
          lastTracked.current.affected,
          lastTracked.current.cache,
          lastTracked.current.assumeChangedIfNotAffected,
        )) {
        // not changed
        return;
      }
      forceUpdate();
    };
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe]);
  const proxyCache = useRef(new WeakMap()); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache.current);
};
