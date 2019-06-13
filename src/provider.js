import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { batchedUpdates } from './batchedUpdates';

import { useForceUpdate } from './utils';

// context
const warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },
  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },
};
const calculateChangedBits = (a, b) => (
  a.dispatch !== b.dispatch || a.subscribe !== b.subscribe ? 1 : 0
);
export const ReduxStoreContext = createContext(warningObject, calculateChangedBits);

export const ReduxProvider = ({ store, children }) => {
  const forceUpdate = useForceUpdate();
  const state = store.getState();
  const listeners = useRef([]);
  useEffect(() => {
    batchedUpdates(() => {
      listeners.current.forEach(listener => listener(state));
    });
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
    ReduxStoreContext.Provider,
    { value: { state, dispatch: store.dispatch, subscribe } },
    children,
  );
};
