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
var OWN_KEYS_SYMBOL = Symbol('OWN_KEYS');

var createProxyHandler = function createProxyHandler() {
  return {
    recordUsage: function recordUsage(target, key) {
      var used = this.affected.get(target);

      if (!used) {
        this.affected.set(target, [key]);
      } else if (!used.includes(key)) {
        used.push(key);
      }
    },
    get: function get(target, key) {
      this.recordUsage(target, key);
      var val = target[key];

      if (_typeof(val) !== 'object') {
        return val;
      }

      var proto = Object.getPrototypeOf(val);

      if (proto !== Object.prototype && proto !== Array.prototype) {
        return val;
      }

      if (Object.isFrozen(target)) {
        return val;
      } // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define


      return createDeepProxy(val, this.affected, this.proxyCache);
    },
    has: function has(target, key) {
      // LIMITATION:
      // We simply record the same as get.
      // This means { a: {} } and { a: {} } is detected as changed,
      // if 'a' in obj is handled.
      this.recordUsage(target, key);
      return key in target;
    },
    ownKeys: function ownKeys(target) {
      this.recordUsage(target, OWN_KEYS_SYMBOL);
      return Reflect.ownKeys(target);
    }
  };
};

var createDeepProxy = function createDeepProxy(obj, affected, proxyCache) {
  var proxyHandler = proxyCache && proxyCache.get(obj);

  if (!proxyHandler) {
    proxyHandler = createProxyHandler();
    proxyHandler.proxy = new Proxy(obj, proxyHandler);

    if (proxyCache) {
      proxyCache.set(obj, proxyHandler);
    }
  }

  proxyHandler.affected = affected;
  proxyHandler.proxyCache = proxyCache;
  return proxyHandler.proxy;
};

exports.createDeepProxy = createDeepProxy;

var isOwnKeysChanged = function isOwnKeysChanged(origObj, nextObj) {
  var origKeys = Reflect.ownKeys(origObj);
  var nextKeys = Reflect.ownKeys(nextObj);
  return origKeys.length !== nextKeys.length || origKeys.some(function (k, i) {
    return k !== nextKeys[i];
  });
};

var isDeepChanged = function isDeepChanged(origObj, nextObj, affected, cache, assumeChangedIfNotAffected) {
  if (origObj === nextObj) return false;
  if (_typeof(origObj) !== 'object') return true;
  if (_typeof(nextObj) !== 'object') return true;
  var used = affected.get(origObj);
  if (!used) return !!assumeChangedIfNotAffected;

  if (cache) {
    var hit = cache.get(origObj);

    if (hit && hit.nextObj === nextObj) {
      return hit.changed;
    } // for object with cycles (changed is `undefined`)


    cache.set(origObj, {
      nextObj: nextObj
    });
  }

  var changed = null;

  for (var i = 0; i < used.length; ++i) {
    var key = used[i];
    var c = key === OWN_KEYS_SYMBOL ? isOwnKeysChanged(origObj, nextObj) : isDeepChanged(origObj[key], nextObj[key], affected, cache, assumeChangedIfNotAffected !== false);
    if (typeof c === 'boolean') changed = c;
    if (changed) break;
  }

  if (changed === null) changed = !!assumeChangedIfNotAffected;

  if (cache) {
    cache.set(origObj, {
      nextObj: nextObj,
      changed: changed
    });
  }

  return changed;
};

exports.isDeepChanged = isDeepChanged;