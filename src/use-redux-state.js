import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { proxyEqual } from 'proxyequal';

import { ReduxStoreContext } from './provider';

import { createTrapped, useForceUpdate } from './utils';

export const useReduxState = () => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // cache
  const cacheRef = useRef({
    proxy: new WeakMap(),
    trapped: new WeakMap(),
  });
  // trapped
  const trapped = createTrapped(state, cacheRef.current);
  // ref
  const lastTracked = useRef(null);
  useLayoutEffect(() => {
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
  useLayoutEffect(() => {
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
