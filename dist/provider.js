"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReduxProvider = exports.ReduxStoreContext = void 0;

var _react = require("react");

var _batchedUpdates = require("./batchedUpdates");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// context
var warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },

  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  }

};
var ReduxStoreContext = (0, _react.createContext)(warningObject); // patch store with batchedUpdates

exports.ReduxStoreContext = ReduxStoreContext;

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
}; // provider


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