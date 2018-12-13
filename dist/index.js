"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

// global context
var reduxStoreContext = (0, _react.createContext)(); // helper hooks

var forcedReducer = function forcedReducer(state) {
  return !state;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, false)[1];
}; // exports


var ReduxProvider = function ReduxProvider(_ref) {
  var store = _ref.store,
      children = _ref.children;
  return (0, _react.createElement)(reduxStoreContext.Provider, {
    value: store
  }, children);
};

exports.ReduxProvider = ReduxProvider;

var useReduxDispatch = function useReduxDispatch() {
  var store = (0, _react.useContext)(reduxStoreContext);
  return store.dispatch;
};

exports.useReduxDispatch = useReduxDispatch;

var useReduxState = function useReduxState() {
  var forceUpdate = useForceUpdate();
  var store = (0, _react.useContext)(reduxStoreContext);
  var state = (0, _react.useRef)(store.getState());
  var prev = (0, _react.useRef)(null);
  var proxyMap = (0, _react.useRef)(new WeakMap());
  var trapped = (0, _react.useRef)(null);

  if (state.current !== prev.current) {
    trapped.current = (0, _proxyequal.proxyState)(state.current, null, proxyMap.current);
    prev.current = state.current;
  }

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var changed = !(0, _proxyequal.proxyEqual)(state.current, nextState, trapped.current.affected);

      if (changed) {
        state.current = nextState;
        forceUpdate();
      }
    };

    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, []);
  return trapped.current.state;
};

exports.useReduxState = useReduxState;