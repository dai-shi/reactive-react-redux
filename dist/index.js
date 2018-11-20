"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bailOutHack = exports.useReduxState = exports.useReduxDispatch = exports.ReduxProvider = void 0;

var _react = require("react");

var _proxyequal = require("proxyequal");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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
}; // for bailOutHack


var ErrorBoundary =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(ErrorBoundary, _PureComponent);

  function ErrorBoundary(props) {
    var _this;

    _classCallCheck(this, ErrorBoundary);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ErrorBoundary).call(this, props));
    _this.lastChildren = null;
    _this.state = {
      hasError: false
    };
    return _this;
  }

  _createClass(ErrorBoundary, [{
    key: "render",
    value: function render() {
      var hasError = this.state.hasError;

      if (hasError) {
        return (0, _react.createElement)(ErrorBoundary, {}, this.lastChildren);
      }

      var children = this.props.children;
      this.lastChildren = children;
      return children;
    }
  }], [{
    key: "getDerivedStateFromError",
    value: function getDerivedStateFromError() {
      return {
        hasError: true
      };
    }
  }]);

  return ErrorBoundary;
}(_react.PureComponent); // exports


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
  var prevInputs = (0, _react.useRef)([]);
  var proxyMap = (0, _react.useRef)(new WeakMap());
  var trapped = (0, _react.useRef)(null);
  var changed = !prevState.current || !inputs || !inputs.every(function (x, i) {
    return inputs[i] === prevInputs.current[i];
  }) || !(0, _proxyequal.proxyEqual)(prevState.current, state, trapped.current.affected);
  if (!changed) throw new Error('bail out');
  prevState.current = state;
  prevInputs.current = inputs;
  trapped.current = (0, _proxyequal.proxyState)(state, null, proxyMap.current);
  return trapped.current.state;
};

exports.useReduxState = useReduxState;

var bailOutHack = function bailOutHack(FunctionComponent) {
  return function (props) {
    var HackComponent = function HackComponent() {
      var element = (0, _react.useRef)(null);

      try {
        element.current = FunctionComponent(props);
      } catch (e) {
        if (e.message !== 'bail out') {
          throw e;
        }
      }

      return element.current;
    };

    return (0, _react.createElement)(ErrorBoundary, {}, (0, _react.createElement)(HackComponent));
  };
};

exports.bailOutHack = bailOutHack;