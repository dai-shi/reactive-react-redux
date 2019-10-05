import {
  useContext,
  useEffect,
  useRef,
  useReducer,
} from 'react';

import { defaultContext } from './Provider';

import { useIsomorphicLayoutEffect } from './utils';

const isFunction = f => typeof f === 'function';
const defaultEqualityFn = (a, b) => a === b;

export const useSelector = (selector, eqlFn, opts) => {
  const {
    equalityFn = isFunction(eqlFn) ? eqlFn : defaultEqualityFn,
    customContext = defaultContext,
  } = opts || (!isFunction(eqlFn) && eqlFn) || {};
  const [, forceUpdate] = useReducer(c => c + 1, 0);
  const { state, subscribe } = useContext(customContext);
  const selected = selector(state);
  const ref = useRef(null);
  useIsomorphicLayoutEffect(() => {
    ref.current = {
      equalityFn,
      selector,
      state,
      selected,
    };
  });
  useEffect(() => {
    const callback = (nextState) => {
      try {
        if (ref.current.state === nextState
          || ref.current.equalityFn(ref.current.selected, ref.current.selector(nextState))) {
          // not changed
          return;
        }
      } catch (e) {
        // ignored (stale props or some other reason)
      }
      forceUpdate();
    };
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe]);
  return selected;
};
