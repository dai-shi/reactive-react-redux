import { useEffect, useLayoutEffect, useReducer } from 'react';

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// useForceUpdate hook
const forcedReducer = state => state + 1;
export const useForceUpdate = () => useReducer(forcedReducer, 0)[1];

export const createDeepProxy = (obj, affected) => {
  const proxyMap = {};
  const handler = {
    get: (target, key) => {
      if (!affected.has(obj)) {
        affected.set(obj, [key]);
      } else {
        const used = affected.get(obj);
        if (!used.includes(key)) used.push(key);
      }
      const val = obj[key];
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

const deepChangedCache = new WeakMap();
export const isDeepChanged = (origObj, nextObj, affected) => {
  if (origObj === nextObj) return false;
  if (typeof origObj !== 'object') return true;
  if (typeof nextObj !== 'object') return true;
  if (!affected.has(origObj)) return false; // is this safe???
  if (deepChangedCache.has(affected)) {
    const hit = deepChangedCache.get(affected);
    if (hit.origObj === origObj && hit.nextObj === nextObj) {
      return hit.changed;
    }
  }
  const changed = affected.get(origObj)
    .some(key => isDeepChanged(origObj[key], nextObj[key], affected));
  deepChangedCache.set(affected, { origObj, nextObj, changed });
  return changed;
};
