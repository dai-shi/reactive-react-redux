import {
  useContext,
  useEffect,
  useRef,
} from 'react';

import memoize from 'memoize-state';

import { withKnowUsage } from 'with-known-usage';

import { ReduxStoreContext } from './provider';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

const createMap = (keys, create) => {
  // "Map" here means JavaScript Object not JavaScript Map.
  const obj = {};
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    obj[key] = create(key);
  }
  return obj;
};

const memoizedSelectorCache = new WeakMap();

const memoizeSelector = (selector) => {
  if (memoizedSelectorCache.has(selector)) {
    return memoizedSelectorCache.get(selector);
  }
  const memoized = {
    fn: memoize(selector),
    results: new WeakMap(),
  };
  memoizedSelectorCache.set(selector, memoized);
  return memoized;
};

const runSelector = (state, selector) => {
  const memoized = memoizeSelector(selector);
  let value;
  if (memoized.results.has(state)) {
    value = memoized.results.get(state);
  } else {
    value = memoized.fn(state);
    memoized.results.set(state, value);
  }
  return { selector, value };
};

export const useReduxSelectors = (selectorMap) => {
  const forceUpdate = useForceUpdate();
  // redux store&state
  const store = useContext(ReduxStoreContext);
  const state = store.getState();
  // mapped result
  const keys = Object.keys(selectorMap);
  const mapped = createMap(keys, key => runSelector(state, selectorMap[key]));
  const trapped = withKnowUsage(createMap(keys, key => mapped[key].value));
  // update ref
  const lastTracked = useRef(null);
  useIsomorphicLayoutEffect(() => {
    lastTracked.current = { keys, mapped, trapped };
  });
  // fingerprint
  const fingerprint = useRef(Symbol('fingerprint'));
  store.registerFingerprint(fingerprint.current);
  // subscription
  useEffect(() => {
    const callback = () => {
      try {
        const nextState = store.getState();
        let changed = false;
        const nextMapped = createMap(lastTracked.current.keys, (key) => {
          const lastResult = lastTracked.current.mapped[key];
          if (!lastTracked.current.trapped.usage.has(key)) return lastResult;
          const nextResult = runSelector(nextState, lastResult.selector);
          if (nextResult.value !== lastResult.value) {
            changed = true;
          }
          return nextResult;
        });
        if (changed) {
          lastTracked.current.mapped = nextMapped;
          forceUpdate();
        }
      } catch (e) {
        // detect erorr (probably stale props)
        forceUpdate();
      }
    };
    callback.fingerprint = fingerprint.current;
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return trapped.proxy;
};
