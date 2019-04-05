import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  drainDifference,
  proxyState,
  proxyCompare,
  collectValuables,
  deproxify,
} from 'proxyequal';

import { batchedUpdates } from './batchedUpdates';

// global context

const warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },
  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },
};
const ReduxStoreContext = createContext(warningObject);

// utils

const shallowEqualDeproxify = (a, b) => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(key => deproxify(a[key]) === deproxify(b[key]));
};

// helper hooks

const forcedReducer = state => !state;
const useForceUpdate = () => useReducer(forcedReducer, false)[1];

const useProxyfied = (state) => {
  // cache
  const proxyMap = useRef(new WeakMap());
  const trappedMap = useRef(new WeakMap());
  // trapped
  let trapped;
  if (trappedMap.current.has(state)) {
    trapped = trappedMap.current.get(state);
    trapped.reset();
  } else {
    trapped = proxyState(state, null, proxyMap.current);
    trappedMap.current.set(state, trapped);
  }
  // update ref
  const lastProxyfied = useRef(null);
  useEffect(() => {
    lastProxyfied.current = {
      state,
      affected: collectValuables(trapped.affected),
    };
  });
  return {
    proxyfiedState: trapped.state,
    lastProxyfied,
  };
};

// patch store with batchedUpdates

const patchReduxStore = (origStore) => {
  if (!batchedUpdates) return origStore;
  const listeners = [];
  let stateForUpdates;
  const getState = () => {
    if (stateForUpdates) return stateForUpdates;
    return origStore.getState();
  };
  let unsubscribe;
  const subscribe = (listener) => {
    listeners.push(listener);
    if (listeners.length === 1) {
      let pending = false;
      const runBatchedUpdates = () => {
        if (stateForUpdates) {
          pending = true;
          return;
        }
        stateForUpdates = origStore.getState();
        const onFinishRendering = () => {
          stateForUpdates = null;
          if (pending) {
            pending = false;
            runBatchedUpdates();
          }
        };
        // if batchedUpdates is sync
        batchedUpdates(() => {
          listeners.forEach(l => l());
        });
        onFinishRendering();
        // if batchedUpdates is async
        /*
        batchedUpdates(() => {
          listeners.forEach(l => l());
        }, null, onFinishRendering);
        */
      };
      unsubscribe = origStore.subscribe(runBatchedUpdates);
    }
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        unsubscribe();
      }
    };
  };
  return {
    ...origStore,
    getState,
    subscribe,
  };
};

// exports

export const ReduxProvider = ({ store, children }) => {
  const patchedStore = useMemo(() => patchReduxStore(store), [store]);
  return createElement(
    ReduxStoreContext.Provider,
    { value: patchedStore },
    children,
  );
};

export const useReduxDispatch = () => {
  const store = useContext(ReduxStoreContext);
  return store.dispatch;
};

export const useReduxState = () => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // proxyfied
  const { proxyfiedState, lastProxyfied } = useProxyfied(state);
  // subscription
  useEffect(() => {
    const callback = () => {
      const changed = !proxyCompare(
        lastProxyfied.current.state,
        store.getState(),
        lastProxyfied.current.affected,
      );
      drainDifference();
      if (changed) {
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return proxyfiedState;
};

export const useReduxStateMapped = (mapState) => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // proxyfied
  const { proxyfiedState, lastProxyfied } = useProxyfied(state);
  // mapped
  const mapped = mapState(proxyfiedState);
  // update ref
  const lastMapped = useRef(null);
  useEffect(() => {
    lastMapped.current = {
      mapped,
      mapState,
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      let changed = !proxyCompare(
        lastProxyfied.current.state,
        store.getState(),
        lastProxyfied.current.affected,
      );
      drainDifference();
      if (!changed) return; // no state parts interested are changed.
      try {
        changed = !shallowEqualDeproxify(
          lastMapped.current.mapped,
          lastMapped.current.mapState(store.getState()),
        );
      } catch (e) {
        changed = true; // props are likely to be updated
      }
      if (changed) {
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return mapped;
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
  useEffect(() => {
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
