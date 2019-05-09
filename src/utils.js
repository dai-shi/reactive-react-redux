import { useEffect, useLayoutEffect, useReducer } from 'react';

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// useForceUpdate hook
const forcedReducer = state => state + 1;
export const useForceUpdate = () => useReducer(forcedReducer, 0)[1];

// -------------------------------------------------------
// deep proxy
// -------------------------------------------------------

const proxyAttributes = new WeakMap();

const proxyHandler = {
  get: (target, key, proxy) => {
    const { affected, proxyCache } = proxyAttributes.get(proxy);
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
    // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define
    return createDeepProxy(val, affected, proxyCache);
  },
};

export const createDeepProxy = (obj, affected, proxyCache) => {
  let proxy;
  if (proxyCache && proxyCache.has(obj)) {
    proxy = proxyCache.get(obj);
  } else {
    proxy = new Proxy(obj, proxyHandler);
    if (proxyCache) {
      proxyCache.set(obj, proxy);
    }
  }
  proxyAttributes.set(proxy, { affected, proxyCache });
  return proxy;
};

export const isDeepChanged = (
  origObj,
  nextObj,
  affected,
  cache,
  assumeChangedIfNotAffected = false,
) => {
  if (origObj === nextObj) return false;
  if (typeof origObj !== 'object') return true;
  if (typeof nextObj !== 'object') return true;
  if (!affected.has(origObj)) return assumeChangedIfNotAffected;
  if (cache) {
    const hit = cache.get(origObj);
    if (hit && hit.nextObj === nextObj) {
      return hit.changed;
    }
  }
  const changed = affected.get(origObj)
    .some(key => isDeepChanged(origObj[key], nextObj[key], affected, cache, true));
  if (cache) {
    cache.set(origObj, { nextObj, changed });
  }
  return changed;
};
