"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

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
}; // exports


var ReduxProvider = function ReduxProvider(_ref) {
  var store = _ref.store,
      children = _ref.children;
  return (0, _react.createElement)(ReduxStoreContext.Provider, {
    value: store
  }, children);
};

exports.ReduxProvider = ReduxProvider;

var useReduxDispatch = function useReduxDispatch() {
  var store = (0, _react.useContext)(ReduxStoreContext);
  return store.dispatch;
};

exports.useReduxDispatch = useReduxDispatch;

var useReduxState = function useReduxState() {
  var forceUpdate = useForceUpdate();
  var store = (0, _react.useContext)(ReduxStoreContext);
  var state = (0, _react.useRef)();
  state.current = store.getState();
  var proxyMap = (0, _react.useRef)();
  var refreshProxyMap = (0, _react.useRef)(true);

  if (refreshProxyMap.current) {
    proxyMap.current = new WeakMap();
  } else {
    refreshProxyMap.current = true;
  }

  var trapped = (0, _react.useRef)();
  trapped.current = (0, _proxyequal.proxyState)(state.current, null, proxyMap.current);
  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var changed = !(0, _proxyequal.proxyEqual)(state.current, store.getState(), trapped.current.affected);

      if (changed) {
        refreshProxyMap.current = false;
        forceUpdate();
      }
    };

    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]);
  return trapped.current.state;
};

exports.useReduxState = useReduxState;