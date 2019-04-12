"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxSelectors = void 0;

var _react = require("react");

var _memoizeState = _interopRequireDefault(require("memoize-state"));

var _withKnownUsage = require("with-known-usage");

var _provider = require("./provider");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createMap = function createMap(keys, create) {
  // "Map" here means JavaScript Object not JavaScript Map.
  var obj = {};

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    obj[key] = create(key);
  }

  return obj;
};

var memoizedSelectorCache = new WeakMap();

var memoizeSelector = function memoizeSelector(selector) {
  if (memoizedSelectorCache.has(selector)) {
    return memoizedSelectorCache.get(selector);
  }

  var memoized = {
    fn: (0, _memoizeState.default)(selector),
    results: new WeakMap()
  };
  memoizedSelectorCache.set(selector, memoized);
  return memoized;
};

var runSelector = function runSelector(state, selector) {
  var memoized = memoizeSelector(selector);
  var value;

  if (memoized.results.has(state)) {
    value = memoized.results.get(state);
  } else {
    value = memoized.fn(state);
    memoized.results.set(state, value);
  }

  return {
    selector: selector,
    value: value
  };
};

var useReduxSelectors = function useReduxSelectors(selectorMap) {
  var forceUpdate = (0, _utils.useForceUpdate)(); // redux store&state

  var store = (0, _react.useContext)(_provider.ReduxStoreContext);
  var state = store.getState(); // mapped result

  var keys = Object.keys(selectorMap);
  var mapped = createMap(keys, function (key) {
    return runSelector(state, selectorMap[key]);
  });
  var trapped = (0, _withKnownUsage.withKnowUsage)(createMap(keys, function (key) {
    return mapped[key].value;
  })); // update ref

  var lastTracked = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastTracked.current = {
      keys: keys,
      mapped: mapped,
      trapped: trapped
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var changed = false;
      var nextMapped = createMap(lastTracked.current.keys, function (key) {
        var lastResult = lastTracked.current.mapped[key];
        if (!lastTracked.current.trapped.usage.has(key)) return lastResult;
        var nextResult = runSelector(nextState, lastResult.selector);

        if (nextResult.value !== lastResult.value) {
          changed = true;
        }

        return nextResult;
      });

      if (changed) {
        lastTracked.current.mapped = nextMapped;
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return trapped.proxy;
};

exports.useReduxSelectors = useReduxSelectors;