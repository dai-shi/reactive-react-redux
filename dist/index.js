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
}; // helper hooks


var forcedReducer = function forcedReducer(state) {
  return !state;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, false)[1];
};

var useProxyfied = function useProxyfied(stateMap, cache) {
  // keys
  var keys = Object.keys(stateMap); // trapped

  var trappedMap = createMap(keys, function (key) {
    var state = stateMap[key];
    if (!canTrap(state)) return {
      state: state,
      affected: ['.*']
    }; // for primitives

    var trapped;

    if (cache && cache.current.trapped.has(state)) {
      trapped = cache.current.trapped.get(state);
      trapped.reset();
    } else {
      trapped = (0, _proxyequal.proxyState)(state, null, cache && cache.current.proxy);
      if (cache) cache.current.trapped.set(state, trapped);
    }

    return trapped;
  }); // update ref

  var lastMap = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    lastMap.current = createMap(keys, function (key) {
      return {
        state: stateMap[key],
        affected: (0, _proxyequal.collectValuables)(trappedMap[key].affected)
      };
    });
  });
  return {
    stateMap: createMap(keys, function (key) {
      return trappedMap[key].state;
    }),
    lastMap: lastMap
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

  var state = store.getState(); // cache

  var cache = (0, _react.useRef)({
    proxy: new WeakMap(),
    trapped: new WeakMap()
  }); // proxyfied (only SINGLE key)

  var _useProxyfied = useProxyfied({
    SINGLE: state
  }, cache),
      stateMap = _useProxyfied.stateMap,
      lastMap = _useProxyfied.lastMap; // subscription


  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var changed = !(0, _proxyequal.proxyCompare)(lastMap.current.SINGLE.state, store.getState(), lastMap.current.SINGLE.affected);
      (0, _proxyequal.drainDifference)();

      if (changed) {
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return stateMap.SINGLE;
};

exports.useReduxState = useReduxState;

var useReduxSelectors = function useReduxSelectors(selectorMap) {
  var forceUpdate = useForceUpdate(); // redux store

  var store = (0, _react.useContext)(ReduxStoreContext); // redux state

  var state = store.getState(); // keys

  var keys = Object.keys(selectorMap); // proxyfied

  var _useProxyfied2 = useProxyfied(createMap(keys, function () {
    return state;
  })),
      stateMap = _useProxyfied2.stateMap,
      lastMap = _useProxyfied2.lastMap; // mapped


  var _useProxyfied3 = useProxyfied(createMap(keys, function (key) {
    return selectorMap[key](stateMap[key]);
  })),
      mapped = _useProxyfied3.stateMap,
      lastMapped = _useProxyfied3.lastMap; // update ref


  var lastState = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    var affected = [];
    keys.forEach(function (key) {
      if (lastMapped.current[key].affected.length) {
        affected.push.apply(affected, _toConsumableArray(lastMap.current[key].affected));
      }
    });
    lastState.current = {
      state: state,
      affected: (0, _proxyequal.collectValuables)(affected)
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var changed = !(0, _proxyequal.proxyCompare)(lastState.current.state, store.getState(), lastState.current.affected);
      (0, _proxyequal.drainDifference)();

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