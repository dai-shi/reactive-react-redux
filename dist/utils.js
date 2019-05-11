"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDeepChanged = exports.createDeepProxy = exports.useForceUpdate = exports.useIsomorphicLayoutEffect = void 0;

var _react = require("react");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
      if (!this.affected.has(target)) {
        this.affected.set(target, [key]);
      } else {
        var used = this.affected.get(target);
        if (!used.includes(key)) used.push(key);
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
  var proxyHandler;
  var proxy;

  if (proxyCache && proxyCache.has(obj)) {
    var _proxyCache$get = proxyCache.get(obj);

    var _proxyCache$get2 = _slicedToArray(_proxyCache$get, 2);

    proxyHandler = _proxyCache$get2[0];
    proxy = _proxyCache$get2[1];
  } else {
    proxyHandler = createProxyHandler();
    proxy = new Proxy(obj, proxyHandler);

    if (proxyCache) {
      proxyCache.set(obj, [proxyHandler, proxy]);
    }
  }

  proxyHandler.affected = affected;
  proxyHandler.proxyCache = proxyCache;
  return proxy;
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
  if (!affected.has(origObj)) return !!assumeChangedIfNotAffected;

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
  var used = affected.get(origObj);

  for (var i = 0; i < used.length; ++i) {
    var key = used[i];
    var c = void 0;

    if (key === OWN_KEYS_SYMBOL) {
      c = isOwnKeysChanged(origObj, nextObj);
    } else {
      c = isDeepChanged(origObj[key], nextObj[key], affected, cache, assumeChangedIfNotAffected !== false);
    }

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