import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useRef,
  useReducer,
} from 'react';

// -------------------------------------------------------
// context
// -------------------------------------------------------

const warningObject = {
  get state() {
    throw new Error('Please use <Provider store={...}>');
  },
  get dispatch() {
    throw new Error('Please use <Provider store={...}>');
  },
  get subscribe() {
    throw new Error('Please use <Provider store={...}>');
  },
};

const calculateChangedBits = (a, b) => (
  a.dispatch !== b.dispatch || a.subscribe !== b.subscribe ? 1 : 0
);

export const createCustomContext = (
  w = warningObject,
  c = calculateChangedBits,
) => createContext(w, c);

export const defaultContext = createCustomContext();

// -------------------------------------------------------
// provider
// -------------------------------------------------------

export const Provider = ({
  store,
  customContext = defaultContext,
  children,
}) => {
  const [, forceUpdate] = useReducer(c => c + 1, 0);
  const state = store.getState();
  const listeners = useRef([]);
  // we call listeners in render intentionally.
  // listeners are not technically pure, but
  // otherwise we can't get benefits from concurrent mode.
  // we make sure to work with double or more invocation of listeners.
  listeners.current.forEach(listener => listener(state));
  const subscribe = useCallback((listener) => {
    listeners.current.push(listener);
    const unsubscribe = () => {
      const index = listeners.current.indexOf(listener);
      listeners.current.splice(index, 1);
    };
    // run once in case the state is already changed
    listener(store.getState());
    return unsubscribe;
  }, [store]);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, [store]);
  return createElement(
    customContext.Provider,
    { value: { state, dispatch: store.dispatch, subscribe } },
    children,
  );
};
