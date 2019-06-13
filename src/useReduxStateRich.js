import {
  useContext,
  useEffect,
  useRef,
} from 'react';

import { proxyState, proxyEqual } from 'proxyequal';

import { defaultContext } from './ReduxProvider';

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

export const useReduxStateRich = (opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const forceUpdate = useForceUpdate();
  // redux state
  const { state, subscribe } = useContext(customContext);
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
    const callback = (nextState) => {
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
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, forceUpdate]);
  return trapped.state;
};
