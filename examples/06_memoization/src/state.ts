const initialState = {
  count: 0,
  person: {
    age: 0,
    name: {
      firstName: '',
      lastName: '',
    },
  },
};

export type State = typeof initialState;

export type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setFirstName'; firstName: string }
  | { type: 'setLastName'; lastName: string }
  | { type: 'setAge'; age: number };

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case 'increment': return {
      ...state,
      count: state.count + 1,
    };
    case 'decrement': return {
      ...state,
      count: state.count - 1,
    };
    case 'setFirstName': return {
      ...state,
      person: {
        ...state.person,
        name: {
          ...state.person.name,
          firstName: action.firstName,
        },
      },
    };
    case 'setLastName': return {
      ...state,
      person: {
        ...state.person,
        name: {
          ...state.person.name,
          lastName: action.lastName,
        },
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
