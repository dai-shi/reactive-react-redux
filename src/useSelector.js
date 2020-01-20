import { useContext, useEffect, useReducer } from 'react';

import { defaultContext } from './Provider';

const isFunction = (f) => typeof f === 'function';
const defaultEqualityFn = (a, b) => a === b;

export const useSelector = (selector, eqlFn, opts) => {
  const {
    equalityFn = isFunction(eqlFn) ? eqlFn : defaultEqualityFn,
    customContext = defaultContext,
  } = opts || (!isFunction(eqlFn) && eqlFn) || {};
  const { state, subscribe } = useContext(customContext);
  const [selected, updateSelected] = useReducer((prevSelected) => {
    const nextSelected = selector(state);
    if (equalityFn(prevSelected, nextSelected)) return prevSelected;
    return nextSelected;
  }, state, selector);
  useEffect(() => {
    const unsubscribe = subscribe(updateSelected);
    return unsubscribe;
  }, [subscribe]);
  return selected;
};
