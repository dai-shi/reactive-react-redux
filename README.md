react-hooks-easy-redux
======================

[![Build Status](https://travis-ci.com/dai-shi/react-hooks-easy-redux.svg?branch=master)](https://travis-ci.com/dai-shi/react-hooks-easy-redux)
[![npm version](https://badge.fury.io/js/react-hooks-easy-redux.svg)](https://badge.fury.io/js/react-hooks-easy-redux)

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
whether used properties are changed. If not, it "bails out"
the rendering process.

The first argument of `useReduxState` is an input array to
avoid bailing out. Typically props are passed,
and if some of them are changed, no bailing out happens.

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
  bailOutHack,
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

const Counter = bailOutHack(() => {
  const state = useReduxState([]);
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
});

const TextBox = bailOutHack(() => {
  const state = useReduxState([]);
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
});

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

The [examples](examples) folder contains a working example.
You can run it with

```bash
PORT=8080 npm run examples:minimal
```

and open <http://localhost:8080> in your web browser.
