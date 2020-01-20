import React from 'react';
import { createStore } from 'redux';

import { render, cleanup, act } from '@testing-library/react';

import { Provider, useSelector } from '../src/index';

describe('stale props spec', () => {
  afterEach(cleanup);

  it('ignores transient errors in selector (e.g. due to stale props)', () => {
    const Parent = () => {
      const count = useSelector((state) => state.count);
      return <Child parentCount={count} />;
    };

    const Child = ({ parentCount }) => {
      const selector = (state) => {
        if (state.count !== parentCount) {
          throw new Error();
        }
        return state.count + parentCount;
      };
      const result = useSelector(selector);
      return <div>{result}</div>;
    };

    const store = createStore((state = { count: -1 }) => ({ count: state.count + 1 }));

    const App = () => (
      <Provider store={store}>
        <Parent />
      </Provider>
    );

    render(<App />);
    act(() => {
      expect(() => store.dispatch({ type: '' })).not.toThrowError();
    });
  });

  it('ensures consistency of state and props in selector', () => {
    let selectorSawInconsistencies = false;

    const Parent = () => {
      const count = useSelector((state) => state.count);
      return <Child parentCount={count} />;
    };

    const Child = ({ parentCount }) => {
      const selector = (state) => {
        selectorSawInconsistencies = selectorSawInconsistencies || (state.count !== parentCount);
        return state.count + parentCount;
      };
      const result = useSelector(selector);
      return <div>{result}</div>;
    };

    const store = createStore((state = { count: -1 }) => ({ count: state.count + 1 }));

    const App = () => (
      <Provider store={store}>
        <Parent />
      </Provider>
    );

    render(<App />);
    act(() => {
      store.dispatch({ type: '' });
    });
    expect(selectorSawInconsistencies).toBe(false);
  });
});
