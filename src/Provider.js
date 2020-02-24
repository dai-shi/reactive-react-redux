import {
  createContext,
  createElement,
  useCallback,
  useLayoutEffect,
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
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const state = store.getState();
  const listeners = useRef([]);
  if (process.env.NODE_ENV !== 'production') {
    // we use layout effect to eliminate warnings.
    // but, this leads tearing with startTransition.
    // https://github.com/dai-shi/use-context-selector/pull/13
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      listeners.current.forEach((listener) => listener(state));
    });
  } else {
    // we call listeners in render for optimization.
    // although this is not a recommended pattern,
    // so far this is only the way to make it as expected.
    // we are looking for better solutions.
    // https://github.com/dai-shi/use-context-selector/pull/12
    listeners.current.forEach((listener) => listener(state));
  }
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
    forceUpdate(); // in case it's already changed
    return unsubscribe;
  }, [store]);
  return createElement(
    customContext.Provider,
    { value: { state, dispatch: store.dispatch, subscribe } },
    children,
  );
};
