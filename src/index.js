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

const ReduxStoreContext = createContext();

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
  const state = useRef(store.getState());
  const prevState = useRef(null);
  const proxyMap = useRef(new WeakMap());
  const trapped = useRef(null);
  if (state.current !== prevState.current) {
    trapped.current = proxyState(state.current, null, proxyMap.current);
    prevState.current = state.current;
  }
  useEffect(() => {
    if (state.current !== store.getState()) {
      // store changed, re-initializing
      state.current = store.getState();
      prevState.current = null;
      proxyMap.current = new WeakMap();
      forceUpdate();
    }
    const callback = () => {
      const nextState = store.getState();
      const changed = !proxyEqual(state.current, nextState, trapped.current.affected);
      if (changed) {
        state.current = nextState;
        forceUpdate();
      }
    };
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]);
  return trapped.current.state;
};
