import { TodoType, Action } from '../types';

const todos = (state: TodoType[] = [], action: Action): TodoType[] => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false,
        },
      ];
    case 'TOGGLE_TODO':
      return state.map((todo: TodoType) => (
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      ));
    default:
      return state;
  }
};

export default todos;
