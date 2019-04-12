"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useForceUpdate = exports.createTrapped = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

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
}; // useForceUpdate hook


exports.createTrapped = createTrapped;

var forcedReducer = function forcedReducer(state) {
  return state + 1;
};

var useForceUpdate = function useForceUpdate() {
  return (0, _react.useReducer)(forcedReducer, 0)[1];
};

exports.useForceUpdate = useForceUpdate;