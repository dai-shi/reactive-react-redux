import * as React from 'react';

import { useReduxDispatch, useReduxState } from 'react-hooks-easy-redux';

import { Action, State } from './state';

const { useState } = React;

const Counter = () => {
  const [index, setIndex] = useState(0);
  const state = useReduxState<State>();
  const dispatch = useReduxDispatch<Action>();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count:{state.counter[index]}</span>
        <button type="button" onClick={() => dispatch({ index, type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ index, type: 'decrement' })}>-1</button>
        <input value={index} onChange={e => setIndex(Number(e.target.value) || 0)} />
      </div>
    </div>
  );
};

export default Counter;
