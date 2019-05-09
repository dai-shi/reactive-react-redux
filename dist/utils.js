"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDeepChanged = exports.createDeepProxy = exports.useForceUpdate = exports.useIsomorphicLayoutEffect = void 0;

var _react = require("react");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var useIsomorphicLayoutEffect = typeof window !== 'undefined' ? _react.useLayoutEffect : _react.useEffect; // useForceUpdate hook

exports.useIsomorphicLayoutEffect = useIsomorphicLayoutEffect;

var forcedReducer = function forcedReducer(state) {
  return state + 1;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, 0)[1];
}; // -------------------------------------------------------
// deep proxy
// -------------------------------------------------------


exports.useForceUpdate = useForceUpdate;
var proxyAttributes = new WeakMap();
var proxyHandler = {
  get: function get(target, key, proxy) {
    var _proxyAttributes$get = proxyAttributes.get(proxy),
        affected = _proxyAttributes$get.affected,
        proxyCache = _proxyAttributes$get.proxyCache;

    if (!affected.has(target)) {
      affected.set(target, [key]);
    } else {
      var used = affected.get(target);
      if (!used.includes(key)) used.push(key);
    }

    var val = target[key];

    if (_typeof(val) !== 'object') {
      return val;
    } // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define


    return createDeepProxy(val, affected, proxyCache);
  }
};

var createDeepProxy = function createDeepProxy(obj, affected, proxyCache) {
  var proxy;

  if (proxyCache && proxyCache.has(obj)) {
    proxy = proxyCache.get(obj);
  } else {
    proxy = new Proxy(obj, proxyHandler);

    if (proxyCache) {
      proxyCache.set(obj, proxy);
    }
  }

  proxyAttributes.set(proxy, {
    affected: affected,
    proxyCache: proxyCache
  });
  return proxy;
};

exports.createDeepProxy = createDeepProxy;

var isDeepChanged = function isDeepChanged(origObj, nextObj, affected, cache, assumeChangedIfNotAffected) {
  if (origObj === nextObj) return false;
  if (_typeof(origObj) !== 'object') return true;
  if (_typeof(nextObj) !== 'object') return true;
  if (!affected.has(origObj)) return !!assumeChangedIfNotAffected;

  if (cache) {
    var hit = cache.get(origObj);

    if (hit && hit.nextObj === nextObj) {
      return hit.changed;
    }
  }

  var changed = affected.get(origObj).some(function (key) {
    return isDeepChanged(origObj[key], nextObj[key], affected, cache, assumeChangedIfNotAffected !== false);
  });

  if (cache) {
    cache.set(origObj, {
      nextObj: nextObj,
      changed: changed
    });
  }

  return changed;
};

exports.isDeepChanged = isDeepChanged;