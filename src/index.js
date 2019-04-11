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
  proxyState,
  proxyEqual,
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
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    obj[key] = create(key);
  }
  return obj;
};

const shouldProxy = state => typeof state === 'object';

const createTrapped = (state, cache) => {
  if (!shouldProxy(state)) {
    return { // emulate trapped for primitives
      state, // actually not trapped
      affected: ['.*'], // already mark it as used
      reset: () => null, // void
      seal: () => null, // void
    };
  }
  let trapped;
  if (cache && cache.trapped.has(state)) {
    trapped = cache.trapped.get(state);
    trapped.reset();
  } else {
    trapped = proxyState(state, null, cache && cache.proxy);
    if (cache) cache.trapped.set(state, trapped);
  }
  return trapped;
};

// track state usage in selector, and only rerun if necessary
const runSelector = (state, selector, lastResult) => {
  if (lastResult) {
    const {
      state: lastState,
      selector: lastSelector,
      innerTrapped: lastInnerTrapped,
    } = lastResult;
    const shouldRerunSelector = selector !== lastSelector || !proxyEqual(
      lastState,
      state,
      lastInnerTrapped.affected,
    );
    if (!shouldRerunSelector) {
      return lastResult;
    }
  }
  const innerTrapped = createTrapped(state);
  const value = selector(innerTrapped.state);
  innerTrapped.seal(); // do not track any more
  return {
    state,
    selector,
    innerTrapped,
    value,
  };
};

const concatAffectedChunks = (affectedChunks, last) => {
  const len = last.affectedChunks && last.affectedChunks.length;
  if (affectedChunks.length !== len) {
    return [].concat(...affectedChunks);
  }
  for (let i = 0; i < len; ++i) {
    if (affectedChunks[i] !== last.affectedChunks[i]) {
      return [].concat(...affectedChunks);
    }
  }
  return last.affected;
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
  // trapped
  const trapped = createTrapped(state, cacheRef.current);
  // ref
  const lastTracked = useRef(null);
  useLayoutEffect(() => {
    lastTracked.current = {
      state,
      affected: trapped.affected,
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
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
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return trapped.state;
};

export const useReduxSelectors = (selectorMap) => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // keys
  const keys = Object.keys(selectorMap);
  // lastMapped (ref)
  const lastMapped = useRef({});
  // mapped result
  const mapped = createMap(keys, (key) => {
    const selector = selectorMap[key];
    const lastResult = lastMapped.current[key];
    return runSelector(state, selector, lastResult);
  });
  // if we had `createShallowTrapped, it should perform much better
  const outerTrapped = createTrapped(createMap(keys, key => mapped[key].value));
  // update ref
  const lastTracked = useRef({});
  useLayoutEffect(() => {
    lastMapped.current = mapped;
    const affectedChunks = [];
    keys.forEach((key) => {
      if (outerTrapped.affected.indexOf(`.${key}`) >= 0) {
        const { innerTrapped } = mapped[key];
        affectedChunks.push(innerTrapped.affected);
      }
    });
    const affected = concatAffectedChunks(affectedChunks, lastTracked.current);
    lastTracked.current = { state, affectedChunks, affected };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const innerChanged = !proxyEqual(
        lastTracked.current.state,
        nextState,
        lastTracked.current.affected,
      );
      if (!innerChanged) return;
      let outerChanged = false;
      const nextMapped = createMap(Object.keys(lastMapped.current), (key) => {
        const lastResult = lastMapped.current[key];
        const nextResult = runSelector(nextState, lastResult.selector, lastResult);
        if (nextResult.value !== lastResult.value) {
          outerChanged = true;
        }
        return nextResult;
      });
      if (outerChanged) {
        lastTracked.current.state = nextState;
        lastMapped.current = nextMapped;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return outerTrapped.state;
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
