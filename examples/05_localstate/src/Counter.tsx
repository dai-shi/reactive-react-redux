import React, { useState } from 'react';

import { useDispatch, useTrackedState } from 'reactive-react-redux';

import { Action, State } from './state';

const Counter = () => {
  const [count, setCount] = useState(0);
  const state = useTrackedState<State>();
  const dispatch = useDispatch<Action>();
  return (
    <div>
      <div>
        <span>Local count: {count}</span>
        <button type="button" onClick={() => setCount(v => v + 1)}>+1</button>
        <button type="button" onClick={() => setCount(v => v - 1)}>-1</button>
      </div>
      <div>
        <span>Global count: {state.count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
