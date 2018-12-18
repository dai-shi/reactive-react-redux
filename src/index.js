import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { proxyState, proxyEqual } from 'proxyequal';

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
  const state = useRef();
  state.current = store.getState();
  const proxyMap = useRef();
  const stateUpdated = useRef(false);
  if (stateUpdated.current) {
    stateUpdated.current = false;
  } else {
    proxyMap.current = new WeakMap();
  }
  const trapped = useRef();
  trapped.current = proxyState(state.current, null, proxyMap.current);
  useEffect(() => {
    const callback = () => {
      const changed = !proxyEqual(state.current, store.getState(), trapped.current.affected);
      if (changed) {
        stateUpdated.current = true;
        forceUpdate();
      }
    };
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]);
  return trapped.current.state;
};
