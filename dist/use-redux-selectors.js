"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxSelectors = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _withKnownUsage = require("with-known-usage");

var _provider = require("./provider");

var _utils = require("./utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var createMap = function createMap(keys, create) {
  // "Map" here means JavaScript Object not JavaScript Map.
  var obj = {};

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    obj[key] = create(key);
  }

  return obj;
};

var deproxifyResult = function deproxifyResult(object) {
  if (_typeof(object) !== 'object') return object;
  if ((0, _proxyequal.isProxyfied)(object)) return (0, _proxyequal.deproxify)(object);
  var result = Array.isArray(object) ? [] : {};
  var altered = false;
  Object.key(object).forEach(function (key) {
    result[key] = deproxifyResult(object[key]);

    if (object[key] !== result[key]) {
      altered = true;
    }
  });
  return altered ? result : object;
}; // track state usage in selector, and only rerun if necessary


var runSelector = function runSelector(state, selector, lastResult) {
  if (lastResult) {
    var lastState = lastResult.state,
        lastSelector = lastResult.selector,
        lastInnerTrapped = lastResult.innerTrapped;
    var shouldRerunSelector = selector !== lastSelector || !(0, _proxyequal.proxyEqual)(lastState, state, lastInnerTrapped.affected);

    if (!shouldRerunSelector) {
      return lastResult;
    }
  }

  var innerTrapped = (0, _utils.createTrapped)(state);
  var value = deproxifyResult(selector(innerTrapped.state));
  return {
    state: state,
    selector: selector,
    innerTrapped: innerTrapped,
    value: value
  };
}; // check if any of chunks is changed, if not we return the last one


var concatAffectedChunks = function concatAffectedChunks(affectedChunks, last) {
  var len = last.affectedChunks && last.affectedChunks.length;

  if (affectedChunks.length !== len) {
    var _ref;

    return (_ref = []).concat.apply(_ref, _toConsumableArray(affectedChunks));
  }

  for (var i = 0; i < len; ++i) {
    if (affectedChunks[i] !== last.affectedChunks[i]) {
      var _ref2;

      return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(affectedChunks));
    }
  }

  return last.affected;
};

var useReduxSelectors = function useReduxSelectors(selectorMap) {
  var forceUpdate = (0, _utils.useForceUpdate)(); // redux store

  var store = (0, _react.useContext)(_provider.ReduxStoreContext); // redux state

  var state = store.getState(); // keys

  var keys = Object.keys(selectorMap); // lastTracked (ref)

  var lastTracked = (0, _react.useRef)({}); // mapped result

  var mapped = createMap(keys, function (key) {
    var selector = selectorMap[key];
    var lastResult = lastTracked.current.mapped && lastTracked.current.mapped[key];
    return runSelector(state, selector, lastResult);
  });
  var outerTrapped = (0, _withKnownUsage.withKnowUsage)(createMap(keys, function (key) {
    return mapped[key].value;
  })); // update ref

  (0, _react.useLayoutEffect)(function () {
    var affectedChunks = [];
    keys.forEach(function (key) {
      if (outerTrapped.usage.has(key)) {
        var innerTrapped = mapped[key].innerTrapped;
        affectedChunks.push(innerTrapped.affected);
      }
    });
    var affected = concatAffectedChunks(affectedChunks, lastTracked.current);
    lastTracked.current = {
      state: state,
      mapped: mapped,
      affectedChunks: affectedChunks,
      affected: affected
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var innerChanged = !(0, _proxyequal.proxyEqual)(lastTracked.current.state, nextState, lastTracked.current.affected);
      if (!innerChanged) return;
      var outerChanged = false;
      var nextMapped = createMap(Object.keys(lastTracked.current.mapped), function (key) {
        var lastResult = lastTracked.current.mapped[key];
        var nextResult = runSelector(nextState, lastResult.selector, lastResult);

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
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return outerTrapped.proxy;
};

exports.useReduxSelectors = useReduxSelectors;