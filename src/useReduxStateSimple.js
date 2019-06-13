import {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { defaultContext } from './ReduxProvider';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

// -------------------------------------------------------
// simple version: one depth comparison
// -------------------------------------------------------

export const useReduxStateSimple = (opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const forceUpdate = useForceUpdate();
  const { state, subscribe } = useContext(customContext);
  const used = useRef({});
  const handler = useMemo(() => ({
    get: (target, name) => {
      used.current[name] = true;
      return target[name];
    },
  }), []);
  const lastState = useRef(null);
  useIsomorphicLayoutEffect(() => {
    lastState.current = state;
  });
  useEffect(() => {
    const callback = (nextState) => {
      const changed = Object.keys(used.current).find(
        key => lastState.current[key] !== nextState[key],
      );
      if (changed) {
        forceUpdate();
      }
    };
    const unsubscribe = subscribe(callback);
    const cleanup = () => {
      unsubscribe();
      used.current = {};
    };
    return cleanup;
  }, [subscribe, forceUpdate]);
  return new Proxy(state, handler);
};
