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

const canTrap = (state) => {
  // XXX should we do like shouldInstrument?
  return typeof state === 'object';
};

// helper hooks

const forcedReducer = state => !state;
const useForceUpdate = () => useReducer(forcedReducer, false)[1];

const useProxyfied = (stateMap, cache) => {
  // keys
  const keys = Object.keys(stateMap);
  // trapped
  const trappedMap = createMap(keys, (key) => {
    const state = stateMap[key];
    if (!canTrap(state)) return { state, affected: ['.*'] }; // for primitives
    let trapped;
    if (cache && cache.current.trapped.has(state)) {
      trapped = cache.current.trapped.get(state);
      trapped.reset();
    } else {
      trapped = proxyState(state, null, cache && cache.current.proxy);
      if (cache) cache.current.trapped.set(state, trapped);
    }
    return trapped;
  });
  // update ref
  const lastMap = useRef(null);
  useEffect(() => {
    lastMap.current = createMap(keys, key => ({
      state: stateMap[key],
      affected: collectValuables(trappedMap[key].affected),
    }));
  });
  return {
    stateMap: createMap(keys, key => trappedMap[key].state),
    lastMap,
  };
};

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
  const cache = useRef({
    proxy: new WeakMap(),
    trapped: new WeakMap(),
  });
  // proxyfied (only SINGLE key)
  const { stateMap, lastMap } = useProxyfied({ SINGLE: state }, cache);
  // subscription
  useEffect(() => {
    const callback = () => {
      const changed = !proxyCompare(
        lastMap.current.SINGLE.state,
        store.getState(),
        lastMap.current.SINGLE.affected,
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
  return stateMap.SINGLE;
};

export const useReduxSelectors = (selectorMap) => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // keys
  const keys = Object.keys(selectorMap);
  // proxyfied
  const { stateMap, lastMap } = useProxyfied(createMap(keys, () => state));
  // mapped
  const {
    stateMap: mapped,
    lastMap: lastMapped,
  } = useProxyfied(createMap(keys, key => selectorMap[key](stateMap[key])));
  // update ref
  const lastState = useRef(null);
  useEffect(() => {
    const affected = [];
    keys.forEach((key) => {
      if (lastMapped.current[key].affected.length) {
        affected.push(...lastMap.current[key].affected);
      }
    });
    lastState.current = {
      state,
      affected: collectValuables(affected),
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const changed = !proxyCompare(
        lastState.current.state,
        store.getState(),
        lastState.current.affected,
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
