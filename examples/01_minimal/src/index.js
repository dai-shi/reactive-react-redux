/* eslint-env browser */

import React, { unstable_ConcurrentMode as ConcurrentMode } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

import {
  ReduxProvider,
  useReduxDispatch,
  useReduxState,
} from 'reactive-react-redux';

const initialState = {
  counter: 0,
  text: 'hello',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'increment': return { ...state, counter: state.counter + 1 };
    case 'decrement': return { ...state, counter: state.counter - 1 };
    case 'setText': return { ...state, text: action.text };
    default: return state;
  }
};

const store = createStore(reducer);

const Counter = () => {
  const state = useReduxState();
  const dispatch = useReduxDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count:{state.counter}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

const TextBox = () => {
  const state = useReduxState();
  const dispatch = useReduxDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Text:{state.text}</span>
        <input value={state.text} onChange={event => dispatch({ type: 'setText', text: event.target.value })} />
      </div>
    </div>
  );
};

const App = () => (
  <ConcurrentMode>
    <ReduxProvider store={store}>
      <h1>Counter</h1>
      <Counter />
      <Counter />
      <h1>TextBox</h1>
      <TextBox />
      <TextBox />
    </ReduxProvider>
  </ConcurrentMode>
);

ReactDOM.render(<App />, document.getElementById('app'));
