import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
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
  const [state, setState] = useState(store.getState());
  const listeners = useRef([]);
  useEffect(() => {
    listeners.current.forEach((listener) => listener(state));
  }, [state]);
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
    const callback = () => {
      const nextState = store.getState();
      listeners.current.forEach((listener) => listener(nextState));
      setState(nextState);
    };
    const unsubscribe = store.subscribe(callback);
    callback(); // in case it's already changed
    return unsubscribe;
  }, [store]);
  return createElement(
    customContext.Provider,
    { value: { state, dispatch: store.dispatch, subscribe } },
    children,
  );
};
