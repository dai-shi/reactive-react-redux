import React, { useCallback } from 'react';
import { createStore } from 'redux';

import { render, cleanup } from 'react-testing-library';

import {
  ReduxProvider,
  useReduxState,
  useReduxSelectors,
} from '../src/index';

describe('stale props spec', () => {
  afterEach(cleanup);

  it('ignores transient errors in selector (e.g. due to stale props)', () => {
    const Parent = () => {
      const { count } = useReduxState();
      return <Child parentCount={count} />;
    };

    const Child = ({ parentCount }) => {
      const selectorMap = {
        result: useCallback((state) => {
          if (state.count !== parentCount) {
            throw new Error();
          }
          return state.count + parentCount;
        }, [parentCount]),
      };
      const { result } = useReduxSelectors(selectorMap);
      return <div>{result}</div>;
    };

    const store = createStore((state = { count: -1 }) => ({ count: state.count + 1 }));

    const App = () => (
      <ReduxProvider store={store}>
        <Parent />
      </ReduxProvider>
    );

    render(<App />);
    expect(() => store.dispatch({ type: '' })).not.toThrowError();
  });

  it('ensures consistency of state and props in selector', () => {
    let selectorSawInconsistencies = false;

    const Parent = () => {
      const { count } = useReduxState();
      return <Child parentCount={count} />;
    };

    const Child = ({ parentCount }) => {
      const selectorMap = {
        result: useCallback((state) => {
          selectorSawInconsistencies = selectorSawInconsistencies || (state.count !== parentCount);
          return state.count + parentCount;
        }, [parentCount]),
      };
      const { result } = useReduxSelectors(selectorMap);
      return <div>{result}</div>;
    };

    const store = createStore((state = { count: -1 }) => ({ count: state.count + 1 }));

    const App = () => (
      <ReduxProvider store={store}>
        <Parent />
      </ReduxProvider>
    );

    render(<App />);
    store.dispatch({ type: '' });
    expect(selectorSawInconsistencies).toBe(false);
  });
});
