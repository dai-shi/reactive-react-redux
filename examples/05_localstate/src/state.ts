const initialState = {
  count: 0,
};

export type State = typeof initialState;

export type Action =
  | { type: 'increment' }
  | { type: 'decrement' };

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
    default: return state;
  }
};
