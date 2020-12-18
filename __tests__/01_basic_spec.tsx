import React, { StrictMode } from 'react';
import { AnyAction, createStore } from 'redux';

import { render, fireEvent, cleanup } from '@testing-library/react';

import {
  patchStore,
  useSelector,
  useTrackedState,
} from '../src/index';

describe('basic spec', () => {
  afterEach(cleanup);

  it('hooks are defiend', () => {
    expect(useSelector).toBeDefined();
    expect(useTrackedState).toBeDefined();
  });

  it('create a component', () => {
    const initialState = {
      count1: 0,
    };
    type State = typeof initialState;
    const reducer = (state = initialState, action: AnyAction) => {
      if (action.type === 'increment') {
        return { ...state, count1: state.count1 + 1 };
      }
      return state;
    };
    const store = patchStore<State, AnyAction>(createStore(reducer));
    const Counter = () => {
      const value = useTrackedState(store);
      const { dispatch } = store;
      return (
        <div>
          <span>{value.count1}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        </div>
      );
    };
    const App = () => (
      <StrictMode>
        <>
          <Counter />
          <Counter />
        </>
      </StrictMode>
    );
    const { getAllByText, container } = render(<App />);
    expect(container).toMatchSnapshot();
    fireEvent.click(getAllByText('+1')[0]);
    expect(container).toMatchSnapshot();
  });
});
