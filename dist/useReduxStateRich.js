"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateRich = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _ReduxProvider = require("./ReduxProvider");

var _utils = require("./utils");

// -------------------------------------------------------
// rich version based on proxyequal
// -------------------------------------------------------
var useTrapped = function useTrapped(state) {
  var cacheRef = (0, _react.useRef)({
    proxy: new WeakMap(),
    trapped: new WeakMap()
  });
  var trapped;

  if (cacheRef.current.trapped.has(state)) {
    trapped = cacheRef.current.trapped.get(state);
    trapped.reset();
  } else {
    trapped = (0, _proxyequal.proxyState)(state, null, cacheRef.current.proxy);
    cacheRef.current.trapped.set(state, trapped);
  }

  return trapped;
};

var useReduxStateRich = function useReduxStateRich() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$customContext = opts.customContext,
      customContext = _opts$customContext === void 0 ? _ReduxProvider.defaultContext : _opts$customContext;
  var forceUpdate = (0, _utils.useForceUpdate)(); // redux state

  var _useContext = (0, _react.useContext)(customContext),
      state = _useContext.state,
      subscribe = _useContext.subscribe; // trapped


  var trapped = useTrapped(state); // ref

  var lastTracked = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastTracked.current = {
      state: state,
      affected: trapped.affected
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback(nextState) {
      var changed = !(0, _proxyequal.proxyEqual)(lastTracked.current.state, nextState, lastTracked.current.affected);

      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    };

    var unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, forceUpdate]);
  return trapped.state;
};

exports.useReduxStateRich = useReduxStateRich;