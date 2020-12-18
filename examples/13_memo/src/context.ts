import {
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';
import { Store } from 'redux';
import {
  PatchedStore,
  patchStore,
  useSelector as useSelectorOrig,
  useTrackedState as useTrackedStateOrig,
} from 'reactive-react-redux';

import { State, Action } from './state';

// Context based APIs

const Context = createContext(new Proxy({}, {
  get() { throw new Error('use Provider'); },
}) as PatchedStore<State, Action>);

export const Provider: React.FC<{ store: Store<State, Action> }> = ({
  store,
  children,
}) => {
  const value = useMemo(() => patchStore(store), [store]);
  return createElement(Context.Provider, { value }, children);
};

export const useDispatch = () => useContext(Context).dispatch;

export const useSelector = <Selected>(
  selector: (state: State) => Selected,
) => useSelectorOrig(useContext(Context), selector);

export const useTrackedState = () => useTrackedStateOrig(useContext(Context));
