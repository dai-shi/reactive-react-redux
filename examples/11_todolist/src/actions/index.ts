import { useCallback } from 'react';
import { useDispatch } from 'reactive-react-redux';

import { Action, VisibilityFilterType } from '../types';

let nextTodoId = 0;

export const useAddTodo = () => {
  const dispatch = useDispatch<Action>();
  return useCallback((text: string) => {
    dispatch({
      type: 'ADD_TODO',
      id: nextTodoId++,
      text,
    });
  }, [dispatch]);
};

export const useSetVisibilityFilter = () => {
  const dispatch = useDispatch<Action>();
  return useCallback((filter: VisibilityFilterType) => {
    dispatch({
      type: 'SET_VISIBILITY_FILTER',
      filter,
    });
  }, [dispatch]);
};

export const useToggleTodo = () => {
  const dispatch = useDispatch<Action>();
  return useCallback((id: number) => {
    dispatch({
      type: 'TOGGLE_TODO',
      id,
    });
  }, [dispatch]);
};
