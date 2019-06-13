"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxDispatch = void 0;

var _react = require("react");

var _provider = require("./provider");

var useReduxDispatch = function useReduxDispatch() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$customContext = opts.customContext,
      customContext = _opts$customContext === void 0 ? _provider.defaultContext : _opts$customContext;

  var _useContext = (0, _react.useContext)(customContext),
      dispatch = _useContext.dispatch;

  return dispatch;
};

exports.useReduxDispatch = useReduxDispatch;