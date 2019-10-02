import {
  useContext,
  useEffect,
  useRef,
} from 'react';

import { defaultContext } from './Provider';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

const isFunction = f => typeof f === 'function';
const defaultEqualityFn = (a, b) => a === b;

export const useSelector = (selector, eqlFn, opts) => {
  const {
    equalityFn = isFunction(eqlFn) ? eqlFn : defaultEqualityFn,
    customContext = defaultContext,
  } = opts || (!isFunction(eqlFn) && eqlFn) || {};
  const forceUpdate = useForceUpdate();
  const { state, subscribe } = useContext(customContext);
  const ref = useRef(null);
  let selected = selector(state);
  if (ref.current && equalityFn(ref.current.selected, selected)) {
    // to keep referential equality of the selected object
    selected = ref.current.selected;
  }
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
  }, [subscribe, forceUpdate]);
  return selected;
};
