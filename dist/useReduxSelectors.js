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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
    fn: (0, _memoizeState["default"])(selector),
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
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$customContext = opts.customContext,
      customContext = _opts$customContext === void 0 ? _provider.defaultContext : _opts$customContext;
  var forceUpdate = (0, _utils.useForceUpdate)(); // redux state

  var _useContext = (0, _react.useContext)(customContext),
      state = _useContext.state,
      subscribe = _useContext.subscribe; // mapped result


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
    var callback = function callback(nextState) {
      try {
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
      } catch (e) {
        // detect erorr (probably stale props)
        forceUpdate();
      }
    };

    var unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, forceUpdate]);
  return trapped.proxy;
};

exports.useReduxSelectors = useReduxSelectors;