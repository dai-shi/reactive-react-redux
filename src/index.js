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

const reduxStoreContext = createContext();

// helper hooks

const forcedReducer = state => !state;
const useForceUpdate = () => useReducer(forcedReducer, false)[1];

// exports

export const ReduxProvider = ({ store, children }) => createElement(
  reduxStoreContext.Provider,
  { value: store },
  children,
);

export const useReduxDispatch = () => {
  const store = useContext(reduxStoreContext);
  return store.dispatch;
};

export const useReduxState = () => {
  const forceUpdate = useForceUpdate();
  const store = useContext(reduxStoreContext);
  const state = useRef(store.getState());
  const prev = useRef(null);
  const proxyMap = useRef(new WeakMap());
  const trapped = useRef(null);
  if (state.current !== prev.current) {
    trapped.current = proxyState(state.current, null, proxyMap.current);
    prev.current = state.current;
  }
  useEffect(() => {
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
  }, []);
  return trapped.current.state;
};
