import React, { useCallback, StrictMode } from 'react';
import { createStore } from 'redux';

import { render, fireEvent, cleanup } from 'react-testing-library';

import {
  ReduxProvider,
  useReduxSelectors,
  useReduxDispatch,
} from '../src/index';

describe('selectors spec', () => {
  afterEach(cleanup);

  it('should re-render with no false negatives', () => {
    const initialState = {
      counter1: 0,
      counter2: 0,
    };
    const reducer = (state = initialState, action) => {
      if (action.type === 'increment1') {
        return { ...state, counter1: state.counter1 + 1 };
      }
      if (action.type === 'increment2') {
        return { ...state, counter2: state.counter2 + 1 };
      }
      return state;
    };
    const store = createStore(reducer);
    let numOfRenders1 = 0;
    const Counter1 = () => {
      numOfRenders1 += 1;
      const { c1 } = useReduxSelectors({
        c1: useCallback(state => ({ value: state.counter1 }), []),
        c2: useCallback(state => ({ value: state.counter2 }), []),
      });
      const dispatch = useReduxDispatch();
      return (
        <div>
          <span>{c1.value}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment1' })}>inc1</button>
        </div>
      );
    };
    let numOfRenders2 = 0;
    const Counter2 = () => {
      numOfRenders2 += 1;
      const { c2 } = useReduxSelectors({
        c1: useCallback(state => ({ value: state.counter1 }), []),
        c2: useCallback(state => ({ value: state.counter2 }), []),
      });
      const dispatch = useReduxDispatch();
      return (
        <div>
          <span>{c2.value}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment2' })}>inc2</button>
        </div>
      );
    };
    const App = () => (
      <StrictMode>
        <ReduxProvider store={store}>
          <Counter1 />
          <Counter2 />
        </ReduxProvider>
      </StrictMode>
    );
    const { getByText, container } = render(<App />);
    expect(numOfRenders1).toBe(2); // doubled because of StrictMode
    expect(numOfRenders2).toBe(2);
    expect(container).toMatchSnapshot();
    fireEvent.click(getByText('inc1'));
    expect(numOfRenders1).toBe(4);
    expect(numOfRenders2).toBe(2);
    expect(container).toMatchSnapshot();
  });

  it('should re-render with no false positives', () => {
    const initialState = {
      counter1: 0,
      counter2: 0,
    };
    const reducer = (state = initialState, action) => {
      if (action.type === 'increment1') {
        return { ...state, counter1: state.counter1 + 1 };
      }
      if (action.type === 'increment2') {
        return { ...state, counter2: state.counter2 + 1 };
      }
      return state;
    };
    const store = createStore(reducer);
    let numOfRenders1 = 0;
    const Counter1 = () => {
      numOfRenders1 += 1;
      const { c1 } = useReduxSelectors({
        c1: useCallback(state => ({ isBig: state.counter1 > 2 }), []),
        c2: useCallback(state => ({ isBig: state.counter2 > 2 }), []),
      });
      const dispatch = useReduxDispatch();
      return (
        <div>
          <span>{c1.isBig ? 'big' : 'not big'}</span>
          <button type="button" onClick={() => dispatch({ type: 'increment1' })}>inc1</button>
        </div>
      );
    };
    const App = () => (
      <StrictMode>
        <ReduxProvider store={store}>
          <Counter1 />
          <Counter1 />
        </ReduxProvider>
      </StrictMode>
    );
    const { getByText, container } = render(<App />);
    expect(numOfRenders1).toBe(4); // doubled because of StrictMode
    expect(container).toMatchSnapshot();
    fireEvent.click(getByText('inc1'));
    expect(numOfRenders1).toBe(4);
    fireEvent.click(getByText('inc1'));
    expect(numOfRenders1).toBe(4);
    fireEvent.click(getByText('inc1'));
    expect(numOfRenders1).toBe(8);
    // expect(container).toMatchSnapshot();
  });
});
