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

// helper hooks

const forcedReducer = state => state + 1;
const useForceUpdate = () => useReducer(forcedReducer, 0)[1];

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
  useLayoutEffect(() => {
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
  // proxyfied
  const { proxyfiedState, lastProxyfied } = useProxyfied(state);
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const changed = !proxyCompare(
        lastProxyfied.current.state,
        nextState,
        lastProxyfied.current.affected,
      );
      drainDifference();
      if (changed) {
        lastProxyfied.current.state = nextState;
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
