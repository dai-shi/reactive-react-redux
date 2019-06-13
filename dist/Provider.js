"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = exports.defaultContext = exports.createCustomContext = void 0;

var _react = require("react");

var _utils = require("./utils");

// -------------------------------------------------------
// context
// -------------------------------------------------------
var warningObject = {
  get state() {
    throw new Error('Please use <TrackedProvider ...>');
  },

  get dispatch() {
    throw new Error('Please use <TrackedProvider ...>');
  },

  get subscribe() {
    throw new Error('Please use <TrackedProvider ...>');
  }

};

var calculateChangedBits = function calculateChangedBits(a, b) {
  return a.dispatch !== b.dispatch || a.subscribe !== b.subscribe ? 1 : 0;
};

var createCustomContext = function createCustomContext() {
  var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : warningObject;
  var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : calculateChangedBits;
  return (0, _react.createContext)(w, c);
};

exports.createCustomContext = createCustomContext;
var defaultContext = createCustomContext(); // -------------------------------------------------------
// provider
// -------------------------------------------------------

exports.defaultContext = defaultContext;

var Provider = function Provider(_ref) {
  var store = _ref.store,
      _ref$customContext = _ref.customContext,
      customContext = _ref$customContext === void 0 ? defaultContext : _ref$customContext,
      children = _ref.children;
  var forceUpdate = (0, _utils.useForceUpdate)();
  var state = store.getState();
  var listeners = (0, _react.useRef)([]);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    listeners.current.forEach(function (listener) {
      return listener(state);
    });
  }, [state]);
  var subscribe = (0, _react.useCallback)(function (listener) {
    listeners.current.push(listener);

    var unsubscribe = function unsubscribe() {
      var index = listeners.current.indexOf(listener);
      listeners.current.splice(index, 1);
    }; // run once in case the state is already changed


    listener(store.getState());
    return unsubscribe;
  }, [store]);
  (0, _react.useEffect)(function () {
    var unsubscribe = store.subscribe(function () {
      forceUpdate();
    });
    return unsubscribe;
  }, [store, forceUpdate]);
  return (0, _react.createElement)(customContext.Provider, {
    value: {
      state: state,
      dispatch: store.dispatch,
      subscribe: subscribe
    }
  }, children);
};

exports.Provider = Provider;