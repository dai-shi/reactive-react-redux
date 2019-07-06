import * as React from 'react';

import { useDispatch, useTrackedSelectors } from 'reactive-react-redux';

import { Action, State } from './state';

const Counter = () => {
  const { count } = useTrackedSelectors<State, { count: number }>({
    count: state => state.count,
  });
  const dispatch = useDispatch<Action>();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
