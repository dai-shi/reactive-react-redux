import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  proxyEqual,
  isProxyfied,
  deproxify,
} from 'proxyequal';

import { withKnowUsage } from 'with-known-usage';

import { ReduxStoreContext } from './provider';

import {
  createTrapped,
  useForceUpdate,
} from './utils';

const createMap = (keys, create) => {
  // "Map" here means JavaScript Object not JavaScript Map.
  const obj = {};
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    obj[key] = create(key);
  }
  return obj;
};

const deproxifyResult = (object) => {
  if (typeof object !== 'object') return object;
  if (isProxyfied(object)) return deproxify(object);
  const result = Array.isArray(object) ? [] : {};
  let altered = false;
  Object.key(object).forEach((key) => {
    result[key] = deproxifyResult(object[key]);
    if (object[key] !== result[key]) {
      altered = true;
    }
  });
  return altered ? result : object;
};

// track state usage in selector, and only rerun if necessary
const runSelector = (state, selector, lastResult) => {
  if (lastResult) {
    const {
      state: lastState,
      selector: lastSelector,
      innerTrapped: lastInnerTrapped,
    } = lastResult;
    const shouldRerunSelector = selector !== lastSelector || !proxyEqual(
      lastState,
      state,
      lastInnerTrapped.affected,
    );
    if (!shouldRerunSelector) {
      return lastResult;
    }
  }
  const innerTrapped = createTrapped(state);
  const value = deproxifyResult(selector(innerTrapped.state));
  return {
    state,
    selector,
    innerTrapped,
    value,
  };
};

// check if any of chunks is changed, if not we return the last one
const concatAffectedChunks = (affectedChunks, last) => {
  const len = last.affectedChunks && last.affectedChunks.length;
  if (affectedChunks.length !== len) {
    return [].concat(...affectedChunks);
  }
  for (let i = 0; i < len; ++i) {
    if (affectedChunks[i] !== last.affectedChunks[i]) {
      return [].concat(...affectedChunks);
    }
  }
  return last.affected;
};

export const useReduxSelectors = (selectorMap) => {
  const forceUpdate = useForceUpdate();
  // redux store
  const store = useContext(ReduxStoreContext);
  // redux state
  const state = store.getState();
  // keys
  const keys = Object.keys(selectorMap);
  // lastTracked (ref)
  const lastTracked = useRef({});
  // mapped result
  const mapped = createMap(keys, (key) => {
    const selector = selectorMap[key];
    const lastResult = lastTracked.current.mapped && lastTracked.current.mapped[key];
    return runSelector(state, selector, lastResult);
  });
  const outerTrapped = withKnowUsage(createMap(keys, key => mapped[key].value));
  // update ref
  useLayoutEffect(() => {
    const affectedChunks = [];
    keys.forEach((key) => {
      if (outerTrapped.usage.has(key)) {
        const { innerTrapped } = mapped[key];
        affectedChunks.push(innerTrapped.affected);
      }
    });
    const affected = concatAffectedChunks(affectedChunks, lastTracked.current);
    lastTracked.current = {
      state,
      mapped,
      affectedChunks,
      affected,
    };
  });
  // subscription
  useEffect(() => {
    const callback = () => {
      const nextState = store.getState();
      const innerChanged = !proxyEqual(
        lastTracked.current.state,
        nextState,
        lastTracked.current.affected,
      );
      if (!innerChanged) return;
      let outerChanged = false;
      const nextMapped = createMap(Object.keys(lastTracked.current.mapped), (key) => {
        const lastResult = lastTracked.current.mapped[key];
        const nextResult = runSelector(nextState, lastResult.selector, lastResult);
        if (nextResult.value !== lastResult.value) {
          outerChanged = true;
        }
        return nextResult;
      });
      if (outerChanged) {
        lastTracked.current.state = nextState;
        lastTracked.current.mapped = nextMapped;
        forceUpdate();
      }
    };
    // run once in case the state is already changed
    callback();
    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps
  return outerTrapped.proxy;
};
