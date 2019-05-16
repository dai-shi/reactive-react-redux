import {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { proxyState, proxyEqual } from 'proxyequal';

import { ReduxStoreContext } from './provider';

import {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  createDeepProxy,
  isDeepChanged,
} from './utils';

const useTrapped = (state) => {
  const cacheRef = useRef({
    proxy: new WeakMap(),
    trapped: new WeakMap(),
  });
  let trapped;
  if (cacheRef.current.trapped.has(state)) {
    trapped = cacheRef.current.trapped.get(state);
    trapped.reset();
  } else {
    trapped = proxyState(state, null, cacheRef.current.proxy);
    cacheRef.current.trapped.set(state, trapped);
  }
  return trapped;
};

export const useReduxStateRich = () => {
  const forceUpdate = useForceUpdate();
  // redux store&state
  const store = useContext(ReduxStoreContext);
  const state = store.getState();
  // trapped
  const trapped = useTrapped(state);
  // ref
  const lastTracked = useRef(null);
  useIsomorphicLayoutEffect(() => {
    lastTracked.current = {
      state,
      affected: trapped.affected,
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const changed = !proxyEqual(
        lastTracked.current.state,
        nextState,
        lastTracked.current.affected,
      );
      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return trapped.state;
};

export const useReduxState = (opts = {}) => {
  const forceUpdate = useForceUpdate();
  const store = useContext(ReduxStoreContext);
  const state = store.getState();
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
    const callback = () => {
      const nextState = store.getState();
      const changed = isDeepChanged(
        lastTracked.current.state,
        nextState,
        lastTracked.current.affected,
        lastTracked.current.cache,
        lastTracked.current.assumeChangedIfNotAffected,
      );
      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  const proxyCache = useRef(new WeakMap()); // per-hook proxyCache
  return createDeepProxy(state, affected, proxyCache.current);
};

export const useReduxStateSimple = () => {
  const forceUpdate = useForceUpdate();
  const store = useContext(ReduxStoreContext);
  const used = useRef({});
  const handler = useMemo(() => ({
    get: (target, name) => {
      used.current[name] = true;
      return target[name];
    },
  }), []);
  const state = store.getState();
  const lastState = useRef(null);
  useIsomorphicLayoutEffect(() => {
    lastState.current = state;
  });
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const changed = Object.keys(used.current).find(
        key => lastState.current[key] !== nextState[key],
      );
      if (changed) {
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    const cleanup = () => {
      unsubscribe();
      used.current = {};
    };
    return cleanup;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return new Proxy(state, handler);
};
