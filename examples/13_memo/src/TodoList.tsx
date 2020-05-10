import React from 'react';

import { useTrackedState } from 'reactive-react-redux';

import { State } from './state';
import TodoItem from './TodoItem';

const TodoList: React.FC = () => {
  const state = useTrackedState<State>();
  const { todos } = state;
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
};

export default TodoList;
