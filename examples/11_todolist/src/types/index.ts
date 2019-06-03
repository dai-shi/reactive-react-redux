export type VisibilityFilterType =
  | 'SHOW_ALL'
  | 'SHOW_COMPLETED'
  | 'SHOW_ACTIVE';

export type TodoType = {
  id: number;
  text: string;
  completed: boolean;
};

export type State = {
  todos: TodoType[];
  visibilityFilter: VisibilityFilterType;
};

export type Action =
  | { type: 'ADD_TODO'; id: number; text: string }
  | { type: 'SET_VISIBILITY_FILTER'; filter: VisibilityFilterType }
  | { type: 'TOGGLE_TODO'; id: number };
