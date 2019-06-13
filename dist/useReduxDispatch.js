"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxDispatch = void 0;

var _react = require("react");

var _provider = require("./provider");

var useReduxDispatch = function useReduxDispatch() {
  var _useContext = (0, _react.useContext)(_provider.ReduxStoreContext),
      dispatch = _useContext.dispatch;

  return dispatch;
};

exports.useReduxDispatch = useReduxDispatch;