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

// exports

export const ReduxProvider = ({ store, children }) => createElement(
  ReduxStoreContext.Provider,
  { value: store },
  children,
);

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
  const callback = useRef(null);
  useEffect(() => {
    callback.current = () => {
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
    const unsubscribe = store.subscribe(callback.current);
    const cleanup = () => {
      unsubscribe();
      callback.current = null;
    };
    return cleanup;
  }, [store, forceUpdate]);
  // run callback in each commit phase in case something has changed.
  //   [CAUTION] Limitations in subscription in useEffect
  //   There is a possibility that the state from the store is inconsistent
  //   across components which may cause problems in edge cases.
  useEffect(() => {
    if (callback.current) { // XXX don't we need this condition?
      callback.current();
    }
  });
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
  const callback = useRef(null);
  useEffect(() => {
    callback.current = () => {
      const nextState = store.getState();
      const changed = Object.keys(used.current).find(
        key => lastState.current[key] !== nextState[key],
      );
      if (changed) {
        forceUpdate();
      }
    };
    const unsubscribe = store.subscribe(callback.current);
    const cleanup = () => {
      unsubscribe();
      callback.current = null;
      used.current = {};
    };
    return cleanup;
  }, [store, forceUpdate]);
  // run callback in each commit phase in case something has changed.
  useEffect(() => {
    if (callback.current) {
      callback.current();
    }
  });
  return new Proxy(state, handler);
};
