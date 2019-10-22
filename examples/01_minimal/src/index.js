import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

import {
  Provider,
  useDispatch,
  useTrackedState,
} from 'reactive-react-redux';

const initialState = {
  count: 0,
  text: 'hello',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'decrement': return { ...state, count: state.count - 1 };
    case 'setText': return { ...state, text: action.text };
    default: return state;
  }
};

const store = createStore(reducer);

const Counter = () => {
  const state = useTrackedState();
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {state.count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

const TextBox = () => {
  const state = useTrackedState();
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Text: {state.text}</span>
        <input value={state.text} onChange={event => dispatch({ type: 'setText', text: event.target.value })} />
      </div>
    </div>
  );
};

const App = () => (
  <StrictMode>
    <Provider store={store}>
      <h1>Counter</h1>
      <Counter />
      <Counter />
      <h1>TextBox</h1>
      <TextBox />
      <TextBox />
    </Provider>
  </StrictMode>
);

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
