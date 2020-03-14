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
