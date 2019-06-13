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
  var store = (0, _react.useContext)(_provider.ReduxStoreContext);
  var used = (0, _react.useRef)({});
  var handler = (0, _react.useMemo)(function () {
    return {
      get: function get(target, name) {
        used.current[name] = true;
        return target[name];
      }
    };
  }, []);
  var state = store.getState();
  var lastState = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastState.current = state;
  });
  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var changed = Object.keys(used.current).find(function (key) {
        return lastState.current[key] !== nextState[key];
      });

      if (changed) {
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);

    var cleanup = function cleanup() {
      unsubscribe();
      used.current = {};
    };

    return cleanup;
  }, [store, forceUpdate]);
  return new Proxy(state, handler);
};

exports.useReduxStateSimple = useReduxStateSimple;