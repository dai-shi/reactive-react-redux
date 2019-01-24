const initialState = {
  counter: [0, 0, 0],
  person: {
    age: 0,
    firstName: '',
    lastName: '',
  },
};

export type State = typeof initialState;

export type Action =
  | { type: 'dummy' } // XXX typescript somehow complaints without this
  | { type: 'increment'; index: number }
  | { type: 'decrement'; index: number }
  | { type: 'setFirstName'; firstName: string }
  | { type: 'setLastName'; lastName: string }
  | { type: 'setAge'; age: number };

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'increment': return {
      ...state,
      counter: [
        ...state.counter.slice(0, action.index),
        state.counter[action.index] + 1,
        ...state.counter.slice(action.index + 1),
      ],
    };
    case 'decrement': return {
      ...state,
      counter: [
        ...state.counter.slice(0, action.index),
        state.counter[action.index] - 1,
        ...state.counter.slice(action.index + 1),
      ],
    };
    case 'setFirstName': return {
      ...state,
      person: {
        ...state.person,
        firstName: action.firstName,
      },
    };
    case 'setLastName': return {
      ...state,
      person: {
        ...state.person,
        lastName: action.lastName,
      },
    };
    case 'setAge': return {
      ...state,
      person: {
        ...state.person,
        age: action.age,
      },
    };
    default: return state;
  }
};
