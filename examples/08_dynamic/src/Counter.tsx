import * as React from 'react';
import { useState } from 'react';

import { useDispatch, useTrackedState } from 'reactive-react-redux';

import { Action, State } from './state';

const Counter = () => {
  const [index, setIndex] = useState(0);
  const state = useTrackedState<State>();
  const dispatch = useDispatch<Action>();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {state.count[index]}</span>
        <button type="button" onClick={() => dispatch({ index, type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ index, type: 'decrement' })}>-1</button>
        <input value={index} onChange={e => setIndex(Number(e.target.value) || 0)} />
      </div>
    </div>
  );
};

export default Counter;
