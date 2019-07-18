import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { batchedUpdates } from './batchedUpdates';
import { useForceUpdate } from './utils';

// -------------------------------------------------------
// context
// -------------------------------------------------------

const warningObject = {
  get state() {
    throw new Error('Please use <Provider store={...}>');
  },
  get dispatch() {
    throw new Error('Please use <Provider store={...}>');
  },
  get subscribe() {
    throw new Error('Please use <Provider store={...}>');
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
  // we call listeners in render intentionally.
  // listeners are not technically pure, but
  // otherwise we can't get benefits from concurrent mode.
  // we make sure to work with double or more invocation of listeners.
  // maybe we don't need `batchedUpdates` here to ensure top-down updates,
  // but put it just in case. (review wanted)
  batchedUpdates(() => {
    listeners.current.forEach(listener => listener(state));
  });
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
