import React, { StrictMode } from 'react';
import { createStore } from 'redux';

import { render, fireEvent, cleanup } from '@testing-library/react';

import {
  Provider,
  useTrackedState,
  useDispatch,
} from '../src/index';

describe('basic spec', () => {
  afterEach(cleanup);

  it('hooks are defiend', () => {
    expect(useTrackedState).toBeDefined();
    expect(useDispatch).toBeDefined();
  });

  it('create a component', () => {
    const initialState = {
      count1: 0,
    };
    const reducer = (state = initialState, action) => {
      if (action.type === 'increment') {
        return { ...state, count1: state.count1 + 1 };
      }
      return state;
    };
    const store = createStore(reducer);
    const Counter = () => {
      const value = useTrackedState();
      const dispatch = useDispatch();
      return (
        <div>
          <span>{value.count1}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        </div>
      );
    };
    const App = () => (
      <StrictMode>
        <Provider store={store}>
          <Counter />
          <Counter />
        </Provider>
      </StrictMode>
    );
    const { getAllByText, container } = render(<App />);
    expect(container).toMatchSnapshot();
    fireEvent.click(getAllByText('+1')[0]);
    expect(container).toMatchSnapshot();
  });
});
