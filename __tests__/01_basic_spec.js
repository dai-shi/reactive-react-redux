import React from 'react';
import { createStore } from 'redux';

import {
  render,
  fireEvent,
  flushEffects,
  cleanup,
} from 'react-testing-library';

import {
  ReduxProvider,
  useReduxState,
  useReduxDispatch,
} from '../src/index';

describe('basic spec', () => {
  afterEach(cleanup);

  it('hooks are defiend', () => {
    expect(useReduxState).toBeDefined();
    expect(useReduxDispatch).toBeDefined();
  });

  it('create a component', () => {
    const initialState = {
      counter1: 0,
    };
    const reducer = (state = initialState, action) => {
      if (action.type === 'increment') {
        return { ...state, counter1: state.counter1 + 1 };
      }
      return state;
    };
    const store = createStore(reducer);
    const Counter = () => {
      const value = useReduxState();
      const dispatch = useReduxDispatch();
      return (
        <div>
          <span>{value.counter1}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        </div>
      );
    };
    const App = () => (
      <ReduxProvider store={store}>
        <Counter />
        <Counter />
      </ReduxProvider>
    );
    const { getByText, container } = render(<App />);
    expect(container).toMatchSnapshot();
    fireEvent.click(getByText('+1'));
    flushEffects();
    expect(container).toMatchSnapshot();
  });
});
