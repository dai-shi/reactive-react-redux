import { useEffect, useLayoutEffect, useReducer } from 'react';

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// useForceUpdate hook
const forcedReducer = state => state + 1;
export const useForceUpdate = () => useReducer(forcedReducer, 0)[1];

export const createDeepProxy = (obj, affected) => {
  const proxyMap = {};
  const handler = {
    get: (target, key) => {
      if (!affected.has(target)) {
        affected.set(target, [key]);
      } else {
        const used = affected.get(target);
        if (!used.includes(key)) used.push(key);
      }
      const val = target[key];
      if (typeof val !== 'object') {
        return val;
      }
      if (!proxyMap[key]) {
        proxyMap[key] = createDeepProxy(val, affected);
      }
      return proxyMap[key];
    },
  };
  return new Proxy(obj, handler);
};

export const isDeepChanged = (origObj, nextObj, affected, cache, depth = 0) => {
  if (origObj === nextObj) return false;
  if (typeof origObj !== 'object') return true;
  if (typeof nextObj !== 'object') return true;
  if (!affected.has(origObj)) {
    return depth !== 0; // false for root object, but true for others
  }
  if (cache.has(origObj)) {
    const hit = cache.get(origObj);
    if (hit.nextObj === nextObj) {
      return hit.changed;
    }
  }
  const changed = affected.get(origObj)
    .some(key => isDeepChanged(origObj[key], nextObj[key], affected, cache, depth + 1));
  cache.set(origObj, { nextObj, changed });
  return changed;
};
