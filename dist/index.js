"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bailOutHack = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// global context
var reduxDispatchContext = (0, _react.createContext)();
var reduxStateContext = (0, _react.createContext)(); // state provider component

var StateProvider = function StateProvider(_ref) {
  var store = _ref.store,
      children = _ref.children;

  var _useState = (0, _react.useState)(store.getState()),
      _useState2 = _slicedToArray(_useState, 2),
      state = _useState2[0],
      setState = _useState2[1];

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      setState(store.getState());
    };

    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, []);
  return (0, _react.createElement)(reduxStateContext.Provider, {
    value: state
  }, children);
}; // exports


var ReduxProvider = function ReduxProvider(_ref2) {
  var store = _ref2.store,
      children = _ref2.children;
  return (0, _react.createElement)(reduxDispatchContext.Provider, {
    value: store.dispatch
  }, (0, _react.createElement)(StateProvider, {
    store: store
  }, children));
};

exports.ReduxProvider = ReduxProvider;

var useReduxDispatch = function useReduxDispatch() {
  var dispatch = (0, _react.useContext)(reduxDispatchContext);
  return dispatch;
};

exports.useReduxDispatch = useReduxDispatch;

var useReduxState = function useReduxState(inputs) {
  var state = (0, _react.useContext)(reduxStateContext);
  var prevState = (0, _react.useRef)(null);
  var prevInputs = (0, _react.useRef)([]); // We assume state is an object.
  // Checking only one depth for now.

  var used = (0, _react.useRef)({});
  var changed = !prevState.current || !inputs || !inputs.every(function (x, i) {
    return inputs[i] === prevInputs.current[i];
  }) || Object.keys(used.current).find(function (key) {
    return state[key] !== prevState.current[key];
  });
  if (!changed) throw new Error('bail out');
  prevState.current = state;
  prevInputs.current = inputs;
  var handler = {
    get: function get(target, name) {
      used.current[name] = true;
      return target[name];
    }
  };
  return new Proxy(state, handler);
};

exports.useReduxState = useReduxState;

var bailOutHack = function bailOutHack(FunctionComponent) {
  return function (props) {
    var ref = (0, _react.useRef)({});

    try {
      ref.current.lastElement = FunctionComponent(props);
    } catch (e) {
      if (e.message !== 'bail out') {
        throw e;
      }
    }

    return ref.current.lastElement;
  };
};

exports.bailOutHack = bailOutHack;