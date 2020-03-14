const initialState = {
  count: [0, 0, 0],
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
      count: [
        ...state.count.slice(0, action.index),
        state.count[action.index] + 1,
        ...state.count.slice(action.index + 1),
      ],
    };
    case 'decrement': return {
      ...state,
      count: [
        ...state.count.slice(0, action.index),
        state.count[action.index] - 1,
        ...state.count.slice(action.index + 1),
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
