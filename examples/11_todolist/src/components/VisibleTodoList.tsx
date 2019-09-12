/* eslint-disable react/jsx-props-no-spreading */

import * as React from 'react';
import { useTrackedState } from 'reactive-react-redux';

import { TodoType, State, VisibilityFilterType } from '../types';
import { useToggleTodo } from '../actions';
import Todo from './Todo';

const getVisibleTodos = (todos: TodoType[], filter: VisibilityFilterType) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
    default:
      throw new Error(`Unknown filter: ${filter}`);
  }
};

const VisibleTodoList: React.FC = () => {
  const state = useTrackedState<State>();
  const visibleTodos = getVisibleTodos(state.todos, state.visibilityFilter);
  const toggleTodo = useToggleTodo();
  return (
    <ul>
      {visibleTodos.map(todo => (
        <Todo key={todo.id} {...todo} onClick={() => toggleTodo(todo.id)} />
      ))}
    </ul>
  );
};

export default VisibleTodoList;
