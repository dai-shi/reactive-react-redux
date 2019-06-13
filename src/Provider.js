import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

// -------------------------------------------------------
// context
// -------------------------------------------------------

const warningObject = {
  get state() {
    throw new Error('Please use <TrackedProvider ...>');
  },
  get dispatch() {
    throw new Error('Please use <TrackedProvider ...>');
  },
  get subscribe() {
    throw new Error('Please use <TrackedProvider ...>');
  },
};

const calculateChangedBits = (a, b) => (
  a.dispatch !== b.dispatch || a.subscribe !== b.subscribe ? 1 : 0
);

export const createCustomContext = (
  w = warningObject,
  c = calculateChangedBits,
) => createContext(w, c);

export const defaultContext = createCustomContext();

// -------------------------------------------------------
// provider
// -------------------------------------------------------

export const Provider = ({
  store,
  customContext = defaultContext,
  children,
}) => {
  const forceUpdate = useForceUpdate();
  const state = store.getState();
  const listeners = useRef([]);
  useIsomorphicLayoutEffect(() => {
    listeners.current.forEach(listener => listener(state));
  }, [state]);
  const subscribe = useCallback((listener) => {
    listeners.current.push(listener);
    const unsubscribe = () => {
      const index = listeners.current.indexOf(listener);
      listeners.current.splice(index, 1);
    };
    // run once in case the state is already changed
    listener(store.getState());
    return unsubscribe;
  }, [store]);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, [store, forceUpdate]);
  return createElement(
    customContext.Provider,
    { value: { state, dispatch: store.dispatch, subscribe } },
    children,
  );
};
