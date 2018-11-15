import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// global context

const reduxDispatchContext = createContext();
const reduxStateContext = createContext();

// state provider component

const StateProvider = ({ store, children }) => {
  const [state, setState] = useState(store.getState());
  useEffect(() => {
    const callback = () => { setState(store.getState()); };
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, []);
  return createElement(reduxStateContext.Provider, { value: state }, children);
};

// exports

export const ReduxProvider = ({ store, children }) => createElement(
  reduxDispatchContext.Provider,
  { value: store.dispatch },
  createElement(StateProvider, { store }, children),
);

export const useReduxDispatch = () => {
  const dispatch = useContext(reduxDispatchContext);
  return dispatch;
};

export const useReduxState = (inputs) => {
  const state = useContext(reduxStateContext);
  const prevState = useRef(null);
  const prevInputs = useRef([]);
  // We assume state is an object.
  // Checking only one depth for now.
  const used = useRef({});
  const changed = !prevState.current
    || !inputs
    || !inputs.every((x, i) => inputs[i] === prevInputs.current[i])
    || Object.keys(used.current).find(key => state[key] !== prevState.current[key]);
  if (!changed) throw new Error('bail out');
  prevState.current = state;
  prevInputs.current = inputs;
  const handler = {
    get: (target, name) => {
      used.current[name] = true;
      return target[name];
    },
  };
  return new Proxy(state, handler);
};

export const bailOutHack = FunctionComponent => (props) => {
  const ref = useRef({});
  try {
    ref.current.lastElement = FunctionComponent(props);
  } catch (e) {
    if (e.message !== 'bail out') {
      throw e;
    }
  }
  return ref.current.lastElement;
};
