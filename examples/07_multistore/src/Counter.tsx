import * as React from 'react';

import { useReduxDispatch, useReduxState } from 'react-hooks-easy-redux';

import { Action, State } from './state';

const Counter = () => {
  const state = useReduxState<State>();
  const dispatch = useReduxDispatch<Action>();
  return (
    <div>
      <div>
        <span>
          Count:
          {state.counter}
        </span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

export default Counter;
