"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _batchedUpdates = require("./batchedUpdates");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// global context
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
}; // patch store with batchedUpdates


var patchReduxStore = function patchReduxStore(origStore) {
  if (!_batchedUpdates.batchedUpdates) return origStore;
  var listeners = [];
  var unsubscribe;

  var subscribe = function subscribe(listener) {
    listeners.push(listener);

    if (listeners.length === 1) {
      unsubscribe = origStore.subscribe(function () {
        (0, _batchedUpdates.batchedUpdates)(function () {
          listeners.forEach(function (l) {
            return l();
          });
        });
      });
    }

    return function () {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);

      if (listeners.length === 0) {
        unsubscribe();
      }
    };
  };

  return _objectSpread({}, origStore, {
    subscribe: subscribe
  });
}; // exports


var ReduxProvider = function ReduxProvider(_ref) {
  var store = _ref.store,
      children = _ref.children;
  return (0, _react.createElement)(ReduxStoreContext.Provider, {
    value: patchReduxStore(store)
  }, children);
};

exports.ReduxProvider = ReduxProvider;

var useReduxDispatch = function useReduxDispatch() {
  var store = (0, _react.useContext)(ReduxStoreContext);
  return store.dispatch;
};

exports.useReduxDispatch = useReduxDispatch;

var useReduxState = function useReduxState() {
  var forceUpdate = useForceUpdate(); // store&state

  var store = (0, _react.useContext)(ReduxStoreContext);
  var state = store.getState(); // trapped

  var proxyMap = (0, _react.useRef)(new WeakMap());
  var trappedMap = (0, _react.useRef)(new WeakMap());
  var trapped;

  if (trappedMap.current.has(state)) {
    trapped = trappedMap.current.get(state);
    trapped.reset();
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, proxyMap.current);
    trappedMap.current.set(state, trapped);
  } // update refs


  var lastState = (0, _react.useRef)(null);
  var lastAffected = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    lastState.current = state;
    lastAffected.current = (0, _proxyequal.collectValuables)(trapped.affected);
  }); // subscription

  var callback = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    callback.current = function () {
      var changed = !(0, _proxyequal.proxyCompare)(lastState.current, store.getState(), lastAffected.current);
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
  }, [store, forceUpdate]); // run callback in each commit phase in case something has changed.
  //   [CAUTION] Limitations in subscription in useEffect
  //   There is a possibility that the state from the store is inconsistent
  //   across components which may cause problems in edge cases.

  (0, _react.useEffect)(function () {
    if (callback.current) {
      // XXX don't we need this condition?
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
  }, [store, forceUpdate]); // run callback in each commit phase in case something has changed.

  (0, _react.useEffect)(function () {
    if (callback.current) {
      callback.current();
    }
  });
  return new Proxy(state, handler);
};

exports.useReduxStateSimple = useReduxStateSimple;