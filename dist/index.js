"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

// https://github.com/dai-shi/react-hooks-easy-redux/issues/1#issuecomment-449665675
(0, _proxyequal.spreadGuardsEnabled)(false); // global context

var warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },

  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  }

};
var ReduxStoreContext = (0, _react.createContext)(warningObject); // helper hooks

var forcedReducer = function forcedReducer(state) {
  return !state;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, false)[1];
}; // exports


var ReduxProvider = function ReduxProvider(_ref) {
  var store = _ref.store,
      children = _ref.children;
  return (0, _react.createElement)(ReduxStoreContext.Provider, {
    value: store
  }, children);
};

exports.ReduxProvider = ReduxProvider;

var useReduxDispatch = function useReduxDispatch() {
  var store = (0, _react.useContext)(ReduxStoreContext);
  return store.dispatch;
};

exports.useReduxDispatch = useReduxDispatch;

var useReduxState = function useReduxState() {
  var forceUpdate = useForceUpdate();
  var store = (0, _react.useContext)(ReduxStoreContext); // state

  var state = store.getState();
  var lastState = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    lastState.current = state;
  }); // trapped

  var proxyMap = (0, _react.useRef)(new WeakMap());
  var trappedMap = (0, _react.useRef)(new WeakMap());
  var lastTrapped = (0, _react.useRef)(null);
  var trapped;
  (0, _react.useEffect)(function () {
    lastTrapped.current = trapped;
  });

  if (trappedMap.current.has(state)) {
    trapped = trappedMap.current.get(state);
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, proxyMap.current);
    trappedMap.current.set(state, trapped);
  } // subscription


  var callback = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    callback.current = function () {
      var changed = !(0, _proxyequal.proxyEqual)(lastState.current, store.getState(), lastTrapped.current.affected);
      (0, _proxyequal.drainDifference)();

      if (changed) {
        forceUpdate();
      }
    };

    var unsubscribe = store.subscribe(callback.current);

    var cleanup = function cleanup() {
      unsubscribe();
      callback.current = null;
    };

    return cleanup;
  }, [store]); // run callback in each commit phase in case something has changed.

  (0, _react.useEffect)(function () {
    if (callback.current) {
      callback.current();
    }
  });
  return trapped.state;
};

exports.useReduxState = useReduxState;

var useReduxStateSimple = function useReduxStateSimple() {
  var forceUpdate = useForceUpdate();
  var store = (0, _react.useContext)(ReduxStoreContext);
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
  (0, _react.useEffect)(function () {
    lastState.current = state;
  });
  var callback = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    callback.current = function () {
      var nextState = store.getState();
      var changed = Object.keys(used.current).find(function (key) {
        return lastState.current[key] !== nextState[key];
      });

      if (changed) {
        forceUpdate();
      }
    };

    var unsubscribe = store.subscribe(callback.current);

    var cleanup = function cleanup() {
      unsubscribe();
      callback.current = null;
      used.current = {};
    };

    return cleanup;
  }, [store]); // run callback in each commit phase in case something has changed.

  (0, _react.useEffect)(function () {
    if (callback.current) {
      callback.current();
    }
  });
  return new Proxy(state, handler);
};

exports.useReduxStateSimple = useReduxStateSimple;