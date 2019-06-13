import * as React from 'react';
import { useState } from 'react';

import { useDispatch, useTrackedState } from 'reactive-react-redux';

import { Action, State } from './state';

const Counter = () => {
  const [counter, setCounter] = useState(0);
  const state = useTrackedState<State>();
  const dispatch = useDispatch<Action>();
  return (
    <div>
      <div>
        <span>Local counter:{counter}</span>
        <button type="button" onClick={() => setCounter(v => v + 1)}>+1</button>
        <button type="button" onClick={() => setCounter(v => v - 1)}>-1</button>
      </div>
      <div>
        <span>Global counter:{state.counter}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
