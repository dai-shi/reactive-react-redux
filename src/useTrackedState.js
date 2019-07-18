import {
  useContext,
  useEffect,
  useRef,
} from 'react';

import { defaultContext } from './Provider';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

import { createDeepProxy, isDeepChanged } from './deepProxy';

export const useTrackedState = (opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const forceUpdate = useForceUpdate();
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
      lastTracked.current.state = nextState;
      forceUpdate();
    };
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, forceUpdate]);
  const proxyCache = useRef(new WeakMap()); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache.current);
};
