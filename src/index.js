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

const useForceUpdate = () => useReducer(state => !state, false)[1];

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
  const state = useRef();
  state.current = store.getState();
  const proxyMap = useRef();
  const refreshProxyMap = useRef(true);
  if (refreshProxyMap.current) {
    proxyMap.current = new WeakMap();
  } else {
    refreshProxyMap.current = true;
  }
  const trapped = useRef();
  trapped.current = proxyState(state.current, null, proxyMap.current);
  useEffect(() => {
    const callback = () => {
      const changed = !proxyEqual(state.current, store.getState(), trapped.current.affected);
      drainDifference();
      if (changed) {
        refreshProxyMap.current = false;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]);
  return trapped.current.state;
};

export const useReduxStateSimple = () => {
  const forceUpdate = useForceUpdate();
  const store = useContext(ReduxStoreContext);
  const state = useRef();
  state.current = store.getState();
  const used = useRef({});
  const handler = useMemo(() => ({
    get: (target, name) => {
      used.current[name] = true;
      return target[name];
    },
  }), []);
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const changed = Object.keys(used.current).find(key => state.current[key] !== nextState[key]);
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
  }, [store]);
  return new Proxy(state.current, handler);
};
