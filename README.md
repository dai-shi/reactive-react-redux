react-hooks-easy-redux
======================

[![Build Status](https://travis-ci.com/dai-shi/react-hooks-easy-redux.svg?branch=master)](https://travis-ci.com/dai-shi/react-hooks-easy-redux)
[![npm version](https://badge.fury.io/js/react-hooks-easy-redux.svg)](https://badge.fury.io/js/react-hooks-easy-redux)
[![bundle size](https://badgen.net/bundlephobia/minzip/react-hooks-easy-redux)](https://bundlephobia.com/result?p=react-hooks-easy-redux)

Easy React bindings for Redux by Hooks API

Background
----------

This is an experimental library to use React Hooks API for Redux.
The most common React bindings for Redux is `react-redux`.
While its `connect` is fine tuned for performance,
writing a proper `mapStateToProps` function is sometimes
difficult for beginners.
We propose new React bindings for Redux,
which eliminates `mapStateToProps`.

How it works
------------

A hook `useReduxState` returns the entire Redux state object,
but it keeps track of which properties of the object are used
in rendering. When the state is updated, this hook checks
whether used properties are changed.
Only if it detects changes in the state, it re-renders.

Install
-------

```bash
npm install react-hooks-easy-redux
```

Usage
-----

```javascript
import React from 'react';
import { createStore } from 'redux';
import {
  ReduxProvider,
  useReduxDispatch,
  useReduxState,
} from 'react-hooks-easy-redux';

const initialState = {
  counter: 0,
  text: 'hello',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'increment': return { ...state, counter: state.counter + 1 };
    case 'decrement': return { ...state, counter: state.counter - 1 };
    case 'setText': return { ...state, text: action.text };
    default: return state;
  }
};

const store = createStore(reducer);

const Counter = () => {
  const state = useReduxState();
  const dispatch = useReduxDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>
          Count:
          {state.counter}
        </span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

const TextBox = () => {
  const state = useReduxState();
  const dispatch = useReduxDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>
          Text:
          {state.text}
        </span>
        <input value={state.text} onChange={event => dispatch({ type: 'setText', text: event.target.value })} />
      </div>
    </div>
  );
};

const App = () => (
  <ReduxProvider store={store}>
    <h1>Counter</h1>
    <Counter />
    <Counter />
    <h1>TextBox</h1>
    <TextBox />
    <TextBox />
  </ReduxProvider>
);
```

Example
-------

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 npm run examples:minimal
```

and open <http://localhost:8080> in your web browser.

You can also try them in codesandbox.io:
[01](https://codesandbox.io/s/github/dai-shi/react-hooks-easy-redux/tree/master/examples/01_minimal)
[02](https://codesandbox.io/s/github/dai-shi/react-hooks-easy-redux/tree/master/examples/02_typescript)
[03](https://codesandbox.io/s/github/dai-shi/react-hooks-easy-redux/tree/master/examples/03_deep)
[04](https://codesandbox.io/s/github/dai-shi/react-hooks-easy-redux/tree/master/examples/04_immer)
[05](https://codesandbox.io/s/github/dai-shi/react-hooks-easy-redux/tree/master/examples/05_localstate)
[06](https://codesandbox.io/s/github/dai-shi/react-hooks-easy-redux/tree/master/examples/06_memoization)

Blogs
-----

- [A deadly simple React bindings library for Redux with Hooks API](https://medium.com/@dai_shi/a-deadly-simple-react-bindings-library-for-redux-with-hooks-api-822295857282)
- [Developing React custom hooks for Redux without react-redux](https://medium.com/@dai_shi/developing-react-custom-hooks-for-redux-without-react-redux-483a90de0c71)
