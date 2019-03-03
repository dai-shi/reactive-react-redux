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
  proxyEqual,
  spreadGuardsEnabled,
} from 'proxyequal';

// https://github.com/dai-shi/react-hooks-easy-redux/issues/1#issuecomment-449665675
spreadGuardsEnabled(false);

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
  const store = useContext(ReduxStoreContext);
  // state
  const state = store.getState();
  const lastState = useRef(null);
  useEffect(() => {
    lastState.current = state;
  });
  // trapped
  const proxyMap = useRef(new WeakMap());
  const trappedMap = useRef(new WeakMap());
  const lastTrapped = useRef(null);
  let trapped;
  useEffect(() => {
    lastTrapped.current = trapped;
  });
  if (trappedMap.current.has(state)) {
    trapped = trappedMap.current.get(state);
  } else {
    trapped = proxyState(state, null, proxyMap.current);
    trappedMap.current.set(state, trapped);
  }
  // subscription
  const callback = useRef(null);
  useEffect(() => {
    callback.current = () => {
      const changed = !proxyEqual(
        lastState.current,
        store.getState(),
        lastTrapped.current.affected,
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
  }, [store]);
  // run callback in each commit phase in case something has changed.
  useEffect(() => {
    if (callback.current) {
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
  }, [store]);
  // run callback in each commit phase in case something has changed.
  useEffect(() => {
    if (callback.current) {
      callback.current();
    }
  });
  return new Proxy(state, handler);
};
