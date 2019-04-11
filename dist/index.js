"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateSimple = exports.useReduxSelectors = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _batchedUpdates = require("./batchedUpdates");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    obj[key] = create(key);
  }

  return obj;
};

var createTrapped = function createTrapped(state, cache) {
  var trapped;

  if (cache && cache.trapped.has(state)) {
    trapped = cache.trapped.get(state);
    trapped.reset();
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, cache && cache.proxy);
    if (cache) cache.trapped.set(state, trapped);
  }

  return trapped;
}; // track state usage in selector, and only rerun if necessary


var runSelector = function runSelector(state, selector, lastResult) {
  if (lastResult) {
    var lastState = lastResult.state,
        lastSelector = lastResult.selector,
        lastInnerTrapped = lastResult.innerTrapped;
    var shouldRerunSelector = selector !== lastSelector || !(0, _proxyequal.proxyEqual)(lastState, state, lastInnerTrapped.affected);

    if (!shouldRerunSelector) {
      return lastResult;
    }
  }

  var innerTrapped = createTrapped(state);
  var value = selector(innerTrapped.state);
  innerTrapped.seal(); // do not track any more

  return {
    state: state,
    selector: selector,
    innerTrapped: innerTrapped,
    value: value
  };
}; // check if any of chunks is changed, if not we return the last one


var concatAffectedChunks = function concatAffectedChunks(affectedChunks, last) {
  var len = last.affectedChunks && last.affectedChunks.length;

  if (affectedChunks.length !== len) {
    var _ref;

    return (_ref = []).concat.apply(_ref, _toConsumableArray(affectedChunks));
  }

  for (var i = 0; i < len; ++i) {
    if (affectedChunks[i] !== last.affectedChunks[i]) {
      var _ref2;

      return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(affectedChunks));
    }
  }

  return last.affected;
}; // helper hooks


var forcedReducer = function forcedReducer(state) {
  return state + 1;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, 0)[1];
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


var ReduxProvider = function ReduxProvider(_ref3) {
  var store = _ref3.store,
      children = _ref3.children;
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
  }); // trapped

  var trapped = createTrapped(state, cacheRef.current); // ref

  var lastTracked = (0, _react.useRef)(null);
  (0, _react.useLayoutEffect)(function () {
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

var useReduxSelectors = function useReduxSelectors(selectorMap) {
  var forceUpdate = useForceUpdate(); // redux store

  var store = (0, _react.useContext)(ReduxStoreContext); // redux state

  var state = store.getState(); // keys

  var keys = Object.keys(selectorMap); // lastTracked (ref)

  var lastTracked = (0, _react.useRef)({}); // mapped result

  var mapped = createMap(keys, function (key) {
    var selector = selectorMap[key];
    var lastResult = lastTracked.current.mapped && lastTracked.current.mapped[key];
    return runSelector(state, selector, lastResult);
  }); // if we had `createShallowTrapped, it should perform much better

  var outerTrapped = createTrapped(createMap(keys, function (key) {
    return mapped[key].value;
  })); // update ref

  (0, _react.useLayoutEffect)(function () {
    var affectedChunks = [];
    keys.forEach(function (key) {
      if (outerTrapped.affected.indexOf(".".concat(key)) >= 0) {
        var innerTrapped = mapped[key].innerTrapped;
        affectedChunks.push(innerTrapped.affected);
      }
    });
    var affected = concatAffectedChunks(affectedChunks, lastTracked.current);
    lastTracked.current = {
      state: state,
      mapped: mapped,
      affectedChunks: affectedChunks,
      affected: affected
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var innerChanged = !(0, _proxyequal.proxyEqual)(lastTracked.current.state, nextState, lastTracked.current.affected);
      if (!innerChanged) return;
      var outerChanged = false;
      var nextMapped = createMap(Object.keys(lastTracked.current.mapped), function (key) {
        var lastResult = lastTracked.current.mapped[key];
        var nextResult = runSelector(nextState, lastResult.selector, lastResult);

        if (nextResult.value !== lastResult.value) {
          outerChanged = true;
        }

        return nextResult;
      });

      if (outerChanged) {
        lastTracked.current.state = nextState;
        lastTracked.current.mapped = nextMapped;
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return outerTrapped.state;
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