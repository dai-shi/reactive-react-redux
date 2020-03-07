"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = exports.defaultContext = exports.createCustomContext = void 0;

var _react = require("react");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// -------------------------------------------------------
// context
// -------------------------------------------------------
var warningObject = {
  get state() {
    throw new Error('Please use <Provider store={...}>');
  },

  get dispatch() {
    throw new Error('Please use <Provider store={...}>');
  },

  get subscribe() {
    throw new Error('Please use <Provider store={...}>');
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

  var _useState = (0, _react.useState)(store.getState()),
      _useState2 = _slicedToArray(_useState, 2),
      state = _useState2[0],
      setState = _useState2[1];

  var listeners = (0, _react.useRef)([]);
  (0, _react.useEffect)(function () {
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
    var callback = function callback() {
      var nextState = store.getState();
      listeners.current.forEach(function (listener) {
        return listener(nextState);
      });
      setState(nextState);
    };

    var unsubscribe = store.subscribe(callback);
    callback(); // in case it's already changed

    return unsubscribe;
  }, [store]);
  return (0, _react.createElement)(customContext.Provider, {
    value: {
      state: state,
      dispatch: store.dispatch,
      subscribe: subscribe
    }
  }, children);
};

exports.Provider = Provider;