"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReduxStateRich = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

var _provider = require("./provider");

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
  var forceUpdate = (0, _utils.useForceUpdate)(); // redux store&state

  var store = (0, _react.useContext)(_provider.ReduxStoreContext);
  var state = store.getState(); // trapped

  var trapped = useTrapped(state); // ref

  var lastTracked = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastTracked.current = {
      state: state,
      affected: trapped.affected
    };
  }); // subscription

  (0, _react.useEffect)(function () {
    var callback = function callback() {
      var nextState = store.getState();
      var changed = !(0, _proxyequal.proxyEqual)(lastTracked.current.state, nextState, lastTracked.current.affected);

      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

  return trapped.state;
};

exports.useReduxStateRich = useReduxStateRich;