"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = exports.useReduxSelectors = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _batchedUpdates = require("./batchedUpdates");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

var createMap = function createMap(keys, create) {
  // "Map" here means JavaScript Object not JavaScript Map.
  var obj = {};

  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    obj[key] = create(key);
  }

  return obj;
};

var canTrap = function canTrap(state) {
  // XXX should we do like shouldInstrument?
  return _typeof(state) === 'object';
};

var createProxyfied = function createProxyfied(state, cache) {
  if (!canTrap(state)) {
    // for primitives
    return {
      originalState: state,
      affected: ['.*'] // to mark it already

    };
  } // trapped


  var trapped;

  if (cache && cache.trapped.has(state)) {
    trapped = cache.trapped.get(state);
    trapped.reset();
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, cache && cache.proxy);
    if (cache) cache.trapped.set(state, trapped);
  }

  return {
    originalState: state,
    trappedState: trapped.state,
    affected: trapped.affected // mutable array

  };
}; // helper hooks


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

  var state = store.getState(); // cache

  var cacheRef = (0, _react.useRef)({
    proxy: new WeakMap(),
    trapped: new WeakMap()
  }); // proxyfied

  var proxyfied = createProxyfied(state, cacheRef.current); // ref

  var lastProxyfied = (0, _react.useRef)(null);
  (0, _react.useLayoutEffect)(function () {
    lastProxyfied.current = _objectSpread({}, proxyfied, {
      affected: (0, _proxyequal.collectValuables)(proxyfied.affected)
    });
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var changed = !(0, _proxyequal.proxyCompare)(lastProxyfied.current.state, nextState, lastProxyfied.current.affected);
      (0, _proxyequal.drainDifference)();

      if (changed) {
        lastProxyfied.current.state = nextState;
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return proxyfied.trappedState;
};

exports.useReduxState = useReduxState;

var useReduxSelectors = function useReduxSelectors(selectorMap) {
  var forceUpdate = useForceUpdate(); // redux store

  var store = (0, _react.useContext)(ReduxStoreContext); // redux state

  var state = store.getState(); // keys

  var keys = Object.keys(selectorMap); // cache

  var cacheRef = (0, _react.useRef)({
    proxyfied: new WeakMap()
  }); // proxyfied

  var proxyfiedMap = createMap(keys, function (key) {
    var selector = selectorMap[key];

    if (cacheRef.current.proxyfied.has(selector)) {
      var cached = cacheRef.current.proxyfied.get(selector);
      delete cached.trappedState; // we don't track this time.

      cached.originalState = state;
      return cached;
    }

    var proxyfied = createProxyfied(state);
    cacheRef.current.proxyfied.set(selector, proxyfied);
    return proxyfied;
  }); // mapped

  var mapped = createMap(keys, function (key) {
    var proxyfied = proxyfiedMap[key];
    var partialState = selectorMap[key](proxyfied.trappedState || proxyfied.originalState);
    return createProxyfied(partialState);
  }); // update ref

  var lastProxyfied = (0, _react.useRef)(null);
  (0, _react.useLayoutEffect)(function () {
    var affected = [];
    keys.forEach(function (key) {
      if (mapped[key].affected.length) {
        affected.push.apply(affected, _toConsumableArray(proxyfiedMap[key].affected));
      }
    });
    lastProxyfied.current = {
      originalState: state,
      affected: (0, _proxyequal.collectValuables)(affected)
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var changed = !(0, _proxyequal.proxyCompare)(lastProxyfied.current.originalState, store.getState(), lastProxyfied.current.affected);
      (0, _proxyequal.drainDifference)();

      if (changed) {
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return createMap(keys, function (key) {
    return mapped[key].trappedState || mapped[key].originalState;
  });
};

exports.useReduxSelectors = useReduxSelectors;

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
  (0, _react.useLayoutEffect)(function () {
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