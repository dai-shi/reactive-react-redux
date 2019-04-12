"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxDispatch = void 0;

var _react = require("react");

var _provider = require("./provider");

var useReduxDispatch = function useReduxDispatch() {
  var store = (0, _react.useContext)(_provider.ReduxStoreContext);
  return store.dispatch;
};

exports.useReduxDispatch = useReduxDispatch;