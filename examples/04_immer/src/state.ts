import { createContext, createElement, useContext } from 'react';
import {
  PatchedStore,
  useSelector as useSelectorOrig,
  useTrackedState as useTrackedStateOrig,
} from 'reactive-react-redux';
import { produce } from 'immer';

const initialState = {
  count: 0,
  person: {
    age: 0,
    firstName: '',
    lastName: '',
  },
};

export type State = typeof initialState;

export type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setFirstName'; firstName: string }
  | { type: 'setLastName'; lastName: string }
  | { type: 'setAge'; age: number };

export const reducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case 'increment': draft.count += 1; break;
    case 'decrement': draft.count -= 1; break;
    case 'setFirstName': draft.person.firstName = action.firstName; break;
    case 'setLastName': draft.person.lastName = action.lastName; break;
    case 'setAge': draft.person.age = action.age; break;
  }
});

// Context based APIs

const Context = createContext(new Proxy({}, {
  get() { throw new Error('use Provider'); },
}) as PatchedStore<State, Action>);

export const Provider: React.FC<{ store: PatchedStore<State, Action> }> = ({
  store,
  children,
}) => createElement(Context.Provider, { value: store }, children);

export const useDispatch = () => useContext(Context).dispatch;

export const useSelector = <Selected>(
  selector: (state: State) => Selected,
) => useSelectorOrig(useContext(Context), selector);

export const useTrackedState = () => useTrackedStateOrig(useContext(Context));
