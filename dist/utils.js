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
};

exports.useForceUpdate = useForceUpdate;

var createDeepProxy = function createDeepProxy(obj, affected) {
  var proxyMap = {};
  var handler = {
    get: function get(target, key) {
      if (!affected.has(obj)) {
        affected.set(obj, [key]);
      } else {
        var used = affected.get(obj);
        if (!used.includes(key)) used.push(key);
      }

      var val = obj[key];

      if (_typeof(val) !== 'object') {
        return val;
      }

      if (!proxyMap[key]) {
        proxyMap[key] = createDeepProxy(val, affected);
      }

      return proxyMap[key];
    }
  };
  return new Proxy(obj, handler);
};

exports.createDeepProxy = createDeepProxy;
var deepChangedCache = new WeakMap();

var isDeepChanged = function isDeepChanged(origObj, nextObj, affected) {
  if (origObj === nextObj) return false;
  if (_typeof(origObj) !== 'object') return true;
  if (_typeof(nextObj) !== 'object') return true;
  if (!affected.has(origObj)) return false; // is this safe???

  if (deepChangedCache.has(affected)) {
    var hit = deepChangedCache.get(affected);

    if (hit.origObj === origObj && hit.nextObj === nextObj) {
      return hit.changed;
    }
  }

  var changed = affected.get(origObj).some(function (key) {
    return isDeepChanged(origObj[key], nextObj[key], affected);
  });
  deepChangedCache.set(affected, {
    origObj: origObj,
    nextObj: nextObj,
    changed: changed
  });
  return changed;
};

exports.isDeepChanged = isDeepChanged;