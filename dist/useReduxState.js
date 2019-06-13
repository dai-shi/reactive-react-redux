"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxState = void 0;

var _react = require("react");

var _provider = require("./provider");

var _utils = require("./utils");

var _deepProxy = require("./deepProxy");

var useReduxState = function useReduxState() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var forceUpdate = (0, _utils.useForceUpdate)();

  var _useContext = (0, _react.useContext)(_provider.ReduxStoreContext),
      state = _useContext.state,
      subscribe = _useContext.subscribe;

  var affected = new WeakMap();
  var lastTracked = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastTracked.current = {
      state: state,
      affected: affected,
      cache: new WeakMap(),

      /* eslint-disable no-nested-ternary, indent, @typescript-eslint/indent */
      assumeChangedIfNotAffected: opts.unstable_forceUpdateForStateChange ? true : opts.unstable_ignoreIntermediateObjectUsage ? false :
      /* default */
      null
      /* eslint-enable no-nested-ternary, indent, @typescript-eslint/indent */

    };
  });
  (0, _react.useEffect)(function () {
    var callback = function callback(nextState) {
      var changed = (0, _deepProxy.isDeepChanged)(lastTracked.current.state, nextState, lastTracked.current.affected, lastTracked.current.cache, lastTracked.current.assumeChangedIfNotAffected);

      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    };

    var unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, forceUpdate]);
  var proxyCache = (0, _react.useRef)(new WeakMap()); // per-hook proxyCache

  return (0, _deepProxy.createDeepProxy)(state, affected, proxyCache.current);
};

exports.useReduxState = useReduxState;