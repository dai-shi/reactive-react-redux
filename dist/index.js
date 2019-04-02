"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = exports.useReduxStateMapped = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _batchedUpdates = require("./batchedUpdates");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// global context
var warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },

  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  }

};
var ReduxStoreContext = (0, _react.createContext)(warningObject); // utils

var shallowEqualDeproxify = function shallowEqualDeproxify(a, b) {
  if (a === b) return true;
  if (_typeof(a) !== 'object' || _typeof(b) !== 'object') return false;
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(function (key) {
    return (0, _proxyequal.deproxify)(a[key]) === (0, _proxyequal.deproxify)(b[key]);
  });
}; // helper hooks


var forcedReducer = function forcedReducer(state) {
  return !state;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, false)[1];
};

var useProxyfied = function useProxyfied(state) {
  // cache
  var proxyMap = (0, _react.useRef)(new WeakMap());
  var trappedMap = (0, _react.useRef)(new WeakMap()); // trapped

  var trapped;

  if (trappedMap.current.has(state)) {
    trapped = trappedMap.current.get(state);
    trapped.reset();
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, proxyMap.current);
    trappedMap.current.set(state, trapped);
  } // update ref


  var lastProxyfied = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    lastProxyfied.current = {
      state: state,
      affected: (0, _proxyequal.collectValuables)(trapped.affected)
    };
  });
  return {
    proxyfiedState: trapped.state,
    lastProxyfied: lastProxyfied
  };
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
  var patchedStore = (0, _react.useMemo)(function () {
    return patchReduxStore(store);
  }, [store]);
  return (0, _react.createElement)(ReduxStoreContext.Provider, {
    value: patchedStore
  }, children);
};

exports.ReduxProvider = ReduxProvider;

var useReduxDispatch = function useReduxDispatch() {
  var store = (0, _react.useContext)(ReduxStoreContext);
  return store.dispatch;
};

exports.useReduxDispatch = useReduxDispatch;

var useReduxState = function useReduxState() {
  var forceUpdate = useForceUpdate(); // redux store

  var store = (0, _react.useContext)(ReduxStoreContext); // redux state

  var state = store.getState(); // proxyfied

  var _useProxyfied = useProxyfied(state),
      proxyfiedState = _useProxyfied.proxyfiedState,
      lastProxyfied = _useProxyfied.lastProxyfied; // subscription


  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var changed = !(0, _proxyequal.proxyCompare)(lastProxyfied.current.state, store.getState(), lastProxyfied.current.affected);
      (0, _proxyequal.drainDifference)();

      if (changed) {
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return proxyfiedState;
};

exports.useReduxState = useReduxState;

var useReduxStateMapped = function useReduxStateMapped(mapState) {
  var forceUpdate = useForceUpdate(); // redux store

  var store = (0, _react.useContext)(ReduxStoreContext); // redux state

  var state = store.getState(); // proxyfied

  var _useProxyfied2 = useProxyfied(state),
      proxyfiedState = _useProxyfied2.proxyfiedState,
      lastProxyfied = _useProxyfied2.lastProxyfied; // mapped


  var mapped = mapState(proxyfiedState); // update ref

  var lastMapped = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    lastMapped.current = {
      mapped: mapped,
      mapState: mapState
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var changed = !(0, _proxyequal.proxyCompare)(lastProxyfied.current.state, store.getState(), lastProxyfied.current.affected);
      (0, _proxyequal.drainDifference)();
      if (!changed) return; // no state parts interested are changed.

      try {
        changed = !shallowEqualDeproxify(lastMapped.current.mapped, lastMapped.current.mapState(store.getState()));
      } catch (e) {
        changed = true; // props are likely to be updated
      }

      if (changed) {
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return mapped;
};

exports.useReduxStateMapped = useReduxStateMapped;

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