import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useLayoutEffect,
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

// utils

const createMap = (keys, create) => {
  // "Map" here means JavaScript Object not JavaScript Map.
  const obj = {};
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    obj[key] = create(key);
  }
  return obj;
};
const shouldProxy = state => typeof state === 'object';

const createProxyfied = (state, cache) => {
  if (!shouldProxy(state)) { // for primitives
    return {
      originalState: state,
      trappedState: state, // actually not trapped
      getAffected: () => ['.*'], // to already mark it
      resetAffected: () => null, // void
      seal: () => null, // void
    };
  }
  // trapped
  let trapped;
  if (cache && cache.trapped.has(state)) {
    trapped = cache.trapped.get(state);
    trapped.reset();
  } else {
    trapped = proxyState(state, null, cache && cache.proxy);
    if (cache) cache.trapped.set(state, trapped);
  }
  return {
    originalState: state,
    trappedState: trapped.state,
    getAffected: () => trapped.affected,
    resetAffected: () => trapped.reset(),
    seal: () => trapped.seal(),
  };
};

// helper hooks

const forcedReducer = state => state + 1;
const useForceUpdate = () => useReducer(forcedReducer, 0)[1];

// patch store with batchedUpdates

const patchReduxStore = (origStore) => {
  if (!batchedUpdates) return origStore;
  const listeners = [];
  let unsubscribe;
  const subscribe = (listener) => {
    listeners.push(listener);
    if (listeners.length === 1) {
      unsubscribe = origStore.subscribe(() => {
        batchedUpdates(() => {
          listeners.forEach(l => l());
        });
      });
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
  // cache
  const cacheRef = useRef({
    proxy: new WeakMap(),
    trapped: new WeakMap(),
  });
  // proxyfied
  const proxyfied = createProxyfied(state, cacheRef.current);
  // ref
  const lastProxyfied = useRef(null);
  useLayoutEffect(() => {
    lastProxyfied.current = {
      originalState: proxyfied.originalState,
      affected: collectValuables(proxyfied.getAffected()),
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const changed = !proxyCompare(
        lastProxyfied.current.originalState,
        nextState,
        lastProxyfied.current.affected,
      );
      drainDifference();
      if (changed) {
        lastProxyfied.current.originalState = nextState;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return proxyfied.trappedState;
};

export const useReduxSelectors = (selectorMap) => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // keys
  const keys = Object.keys(selectorMap);
  // cache
  const cacheRef = useRef({
    selectors: new WeakMap(),
  });
  // mapped
  const mapped = createMap(keys, (key) => {
    const selector = selectorMap[key];
    if (cacheRef.current.selectors.has(selector)) {
      const partialProxyfied = cacheRef.current.selectors.get(selector);
      const { proxyfied } = partialProxyfied;
      const shouldRerunSelector = !proxyCompare(
        proxyfied.originalState,
        state,
        proxyfied.affected,
      );
      if (!shouldRerunSelector) {
        partialProxyfied.resetAffected();
        return partialProxyfied;
      }
    }
    const proxyfied = createProxyfied(state);
    const partialState = selector(proxyfied.trappedState);
    proxyfied.seal(); // do not track any more
    // if we had `createShallowProxyfied, it should perform much better
    const partialProxyfied = createProxyfied(partialState);
    partialProxyfied.proxyfied = proxyfied;
    return partialProxyfied;
  });
  // update ref
  const lastProxyfied = useRef(null);
  useLayoutEffect(() => {
    const affected = [];
    keys.forEach((key) => {
      const selector = selectorMap[key];
      const partialProxyfied = mapped[key];
      cacheRef.current.selectors.set(selector, partialProxyfied);
      if (!partialProxyfied.proxyfied.affected) {
        partialProxyfied.proxyfied.affected = collectValuables(
          partialProxyfied.proxyfied.getAffected(),
        );
      }
      if (partialProxyfied.getAffected().length) {
        affected.push(...partialProxyfied.proxyfied.affected);
      }
    });
    lastProxyfied.current = {
      originalState: state,
      affected: collectValuables(affected),
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const changed = !proxyCompare(
        lastProxyfied.current.originalState,
        nextState,
        lastProxyfied.current.affected,
      );
      drainDifference();
      if (changed) {
        lastProxyfied.current.originalState = nextState;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return createMap(keys, key => mapped[key].trappedState);
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
