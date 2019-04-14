"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = exports.useReduxState = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _provider = require("./provider");

var _utils = require("./utils");

var useTrapped = function useTrapped(state) {
  var cacheRef = (0, _react.useRef)({
    proxy: new WeakMap(),
    trapped: new WeakMap()
  });
  var trapped;

  if (cacheRef.current.trapped.has(state)) {
    trapped = cacheRef.current.trapped.get(state);
    trapped.reset();
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, cacheRef.current.proxy);
    cacheRef.current.trapped.set(state, trapped);
  }

  return trapped;
};

var useReduxState = function useReduxState() {
  var forceUpdate = (0, _utils.useForceUpdate)(); // redux store&state

  var store = (0, _react.useContext)(_provider.ReduxStoreContext);
  var state = store.getState(); // trapped

  var trapped = useTrapped(state); // ref

  var lastTracked = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastTracked.current = {
      state: state,
      affected: trapped.affected
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var changed = !(0, _proxyequal.proxyEqual)(lastTracked.current.state, nextState, lastTracked.current.affected);

      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return trapped.state;
};

exports.useReduxState = useReduxState;

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
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return new Proxy(state, handler);
};

exports.useReduxStateSimple = useReduxStateSimple;