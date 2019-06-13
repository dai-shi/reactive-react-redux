import {
  useContext,
  useEffect,
  useRef,
} from 'react';

import { proxyState, proxyEqual } from 'proxyequal';

import { ReduxStoreContext } from './provider';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

// -------------------------------------------------------
// rich version based on proxyequal
// -------------------------------------------------------

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
  }, [store, forceUpdate]);
  return trapped.state;
};
