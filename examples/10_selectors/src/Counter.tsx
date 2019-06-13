import * as React from 'react';

import { useDispatch, useTrackedSelectors } from 'reactive-react-redux';

import { Action, State } from './state';

const Counter = () => {
  const { counter } = useTrackedSelectors<State, { counter: number }>({
    counter: state => state.counter,
  });
  const dispatch = useDispatch<Action>();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count:{counter}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
