import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  PureComponent,
} from 'react';
import { proxyState, proxyEqual } from 'proxyequal';

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

// for bailOutHack

class ErrorBoundary extends PureComponent {
  constructor(props) {
    super(props);
    this.lastChildren = null;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return createElement(
        ErrorBoundary,
        {},
        this.lastChildren,
      );
    }
    const { children } = this.props;
    this.lastChildren = children;
    return children;
  }
}

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
  const proxyMap = useRef(new WeakMap());
  const trapped = useRef(null);
  const changed = !prevState.current
    || !inputs
    || !inputs.every((x, i) => inputs[i] === prevInputs.current[i])
    || !proxyEqual(prevState.current, state, trapped.current.affected);
  if (!changed) throw new Error('bail out');
  prevState.current = state;
  prevInputs.current = inputs;
  trapped.current = proxyState(state, null, proxyMap.current);
  return trapped.current.state;
};

export const bailOutHack = FunctionComponent => (props) => {
  const HackComponent = () => {
    const element = useRef(null);
    try {
      element.current = FunctionComponent(props);
    } catch (e) {
      if (e.message !== 'bail out') {
        throw e;
      }
    }
    return element.current;
  };
  return createElement(ErrorBoundary, {}, createElement(HackComponent));
};
