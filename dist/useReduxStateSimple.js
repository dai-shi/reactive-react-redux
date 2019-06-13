"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = void 0;

var _react = require("react");

var _provider = require("./provider");

var _utils = require("./utils");

// -------------------------------------------------------
// simple version: one depth comparison
// -------------------------------------------------------
var useReduxStateSimple = function useReduxStateSimple() {
  var forceUpdate = (0, _utils.useForceUpdate)();

  var _useContext = (0, _react.useContext)(_provider.ReduxStoreContext),
      state = _useContext.state,
      subscribe = _useContext.subscribe;

  var used = (0, _react.useRef)({});
  var handler = (0, _react.useMemo)(function () {
    return {
      get: function get(target, name) {
        used.current[name] = true;
        return target[name];
      }
    };
  }, []);
  var lastState = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastState.current = state;
  });
  (0, _react.useEffect)(function () {
    var callback = function callback(nextState) {
      var changed = Object.keys(used.current).find(function (key) {
        return lastState.current[key] !== nextState[key];
      });

      if (changed) {
        forceUpdate();
      }
    };

    var unsubscribe = subscribe(callback);

    var cleanup = function cleanup() {
      unsubscribe();
      used.current = {};
    };

    return cleanup;
  }, [subscribe, forceUpdate]);
  return new Proxy(state, handler);
};

exports.useReduxStateSimple = useReduxStateSimple;