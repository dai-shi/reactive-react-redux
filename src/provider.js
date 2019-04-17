import { createContext, createElement, useMemo } from 'react';

import { batchedUpdates } from './batchedUpdates';

// context
const warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },
  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },
};
export const ReduxStoreContext = createContext(warningObject);

// patch store with batchedUpdates
const patchReduxStore = (origStore) => {
  const safeBatchedUpdates = batchedUpdates || (f => f());
  const listeners = [];
  // proof of concept: heuristically reorder listeners to mimic top-down
  const fingerprints = [];
  const registerFingerprint = (fingerprint) => {
    const index = fingerprints.indexOf(fingerprint);
    if (index < 0) fingerprints.push(fingerprint);
  };
  const unregisterFingerprint = (fingerprint) => {
    const index = fingerprints.indexOf(fingerprint);
    if (index >= 0) fingerprints.splice(index, 1);
  };
  const sortListeners = () => {
    listeners.sort((a, b) => {
      const ia = fingerprints.indexOf(a.fingerprint);
      const ib = fingerprints.indexOf(b.fingerprint);
      return ia - ib;
    });
  };
  let unsubscribe;
  const subscribe = (listener) => {
    listeners.push(listener);
    if (listeners.length === 1) {
      unsubscribe = origStore.subscribe(() => {
        if (fingerprints.length) {
          sortListeners();
          // we can't use batchedUpdates because we need to render each time
          listeners.forEach(l => l());
        } else {
          safeBatchedUpdates(() => {
            listeners.forEach(l => l());
          });
        }
      });
    }
    return () => {
      unregisterFingerprint(listener.fingerprint);
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        unsubscribe();
      }
    };
  };
  return {
    ...origStore,
    subscribe,
    registerFingerprint,
  };
};

// provider
export const ReduxProvider = ({ store, children }) => {
  const patchedStore = useMemo(() => patchReduxStore(store), [store]);
  return createElement(
    ReduxStoreContext.Provider,
    { value: patchedStore },
    children,
  );
};
