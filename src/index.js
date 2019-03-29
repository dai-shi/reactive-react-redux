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

// helper hooks

const forcedReducer = state => !state;
const useForceUpdate = () => useReducer(forcedReducer, false)[1];

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
        batchedUpdates(() => {
          listeners.forEach(l => l());
        }, onFinishRendering);
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
  // store&state
  const store = useContext(ReduxStoreContext);
  const state = store.getState();
  // trapped
  const proxyMap = useRef(new WeakMap());
  const trappedMap = useRef(new WeakMap());
  let trapped;
  if (trappedMap.current.has(state)) {
    trapped = trappedMap.current.get(state);
    trapped.reset();
  } else {
    trapped = proxyState(state, null, proxyMap.current);
    trappedMap.current.set(state, trapped);
  }
  // update refs
  const lastState = useRef(null);
  const lastAffected = useRef(null);
  useEffect(() => {
    lastState.current = state;
    lastAffected.current = collectValuables(trapped.affected);
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const changed = !proxyCompare(
        lastState.current,
        store.getState(),
        lastAffected.current,
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
  }, [store, forceUpdate]);
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
  }, [store, forceUpdate]);
  return new Proxy(state, handler);
};
