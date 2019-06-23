# reactive-react-redux

[![Build Status](https://travis-ci.com/dai-shi/reactive-react-redux.svg?branch=master)](https://travis-ci.com/dai-shi/reactive-react-redux)
[![npm version](https://badge.fury.io/js/reactive-react-redux.svg)](https://badge.fury.io/js/reactive-react-redux)
[![bundle size](https://badgen.net/bundlephobia/minzip/reactive-react-redux)](https://bundlephobia.com/result?p=reactive-react-redux)

React Redux binding with React Hooks and Proxy

> If you are looking for a non-Redux library, please visit [react-tracked](https://github.com/dai-shi/react-tracked) which has the same hooks API.

## Introduction

This is a library to bind React and Redux with Hooks API.
It has mostly the same API as the official
[react-redux Hooks API](https://react-redux.js.org/api/hooks),
so it can be used as a drop-in replacement
if you are using only basic functionality.

There are two major features in this library
that are not in the official react-redux.

### 1. useTrackedState hook

This library provides another hook `useTrackedState`
which is a simpler API than already simple `useSelector`.
It returns an entire state, but the library takes care of
optimization of re-renders.
Most likely, `useTrackedState` performs better than
`useSelector` without perfectly tuned selectors.

Technically, `useTrackedState` has no [stale props](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children) issue.

### 2. state-based object for context value

react-redux v7 uses store-based object for context value,
while react-redux v6 used to use state-based object.
Using state-based object naively has
[unable-to-bail-out issue](https://github.com/facebook/react/issues/14110),
but this library uses state-based object with
undocumented function `calculateChangedBits`
to stop propagation of re-renders.

## How tracking works

A hook `useTrackedState` returns an entire Redux state object with Proxy,
and it keeps track of which properties of the object are used
in render. When the state is updated, this hook checks
whether used properties are changed.
Only if it detects changes in the state,
it triggers a component to re-render.

## Install

```bash
npm install reactive-react-redux
```

## Usage (useTrackedState)

```javascript
import React from 'react';
import { createStore } from 'redux';
import {
  Provider,
  useDispatch,
  useTrackedState,
} from 'reactive-react-redux';

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
  const state = useTrackedState();
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count:{state.counter}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

const TextBox = () => {
  const state = useTrackedState();
  const dispatch = useDispatch();
  return (
    <div>
      {Math.random()}
      <div>
        <span>Text:{state.text}</span>
        <input value={state.text} onChange={event => dispatch({ type: 'setText', text: event.target.value })} />
      </div>
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <h1>Counter</h1>
    <Counter />
    <Counter />
    <h1>TextBox</h1>
    <TextBox />
    <TextBox />
  </Provider>
);
```

## API

### Provider

```javascript
const store = createStore(...);
const App = () => (
  <Provider store={store}>
    ...
  </Provider>
);
```

### useDispatch

```javascript
const Component = () => {
  const dispatch = useDispatch();
  // ...
};
```

### useSelector

```javascript
const Component = () => {
  const selected = useSelector(selector);
  // ...
};
```

### useTrackedState

```javascript
const Component = () => {
  const state = useTrackedState();
  // ...
};
```

## Advanced API

<details>
<summary>Experimental useTrackedSelectors</summary>

```javascript
import React, { useCallback } from 'react';
import { useTrackedSelectors } from 'reactive-react-redux';

const globalSelectors = {
  firstName: state => state.person.first,
  lastName: state => state.person.last,
};

const Person = () => {
  const { firstName } = useTrackedSelectors(globalSelectors);
  return <div>{firstName}</div>;
  // this component will only render when `state.person.first` is changed.
};

const Person2 = ({ threshold }) => {
  const { firstName, isYoung } = useTrackedSelectors({
    ...globalSelectors,
    isYoung: useCallback(state => (state.person.age < threshold), [threshold]),
  });
  return <div>{firstName}{isYoung && '(young)'}</div>;
};
```

</details>

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 npm run examples:minimal
```

and open <http://localhost:8080> in your web browser.

You can also try them in codesandbox.io:
[01](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/01_minimal)
[02](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/02_typescript)
[03](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/03_deep)
[04](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/04_immer)
[05](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/05_localstate)
[06](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/06_memoization)
[07](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/07_multistore)
[08](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/08_dynamic)
[09](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/09_thunk)
[10](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/10_selectors)
[11](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/11_todolist)

## Benchmarks

<img alt="benchmark result" src="https://user-images.githubusercontent.com/490574/59726769-e609c000-926d-11e9-8821-cc14bbe78d54.png" width="425" />

See [blog entry](https://blog.axlight.com/posts/benchmark-react-tracked/)
and [#3](https://github.com/dai-shi/reactive-react-redux/issues/3) for details.

## Limitations in tracking

By relying on Proxy,
there are some false negatives (failure to trigger re-renders)
and some false positives (extra re-renders) in edge cases.

### Proxied states are referentially equal only in per-hook basis

```javascript
const state1 = useTrackedState();
const state2 = useTrackedState();
// state1 and state2 is not referentially equal
// even if the underlying redux state is referentially equal.
```

### An object referential change doesn't trigger re-render if an property of the object is accessed in previous render

```javascript
const state = useTrackedState();
const foo = useMemo(() => state.foo, [state]);
const bar = state.bar;
// if state.foo is not evaluated in render,
// it won't trigger re-render if only state.foo is changed.
```

### Proxied state shouldn't be used outside of render

```javascript
const state = useTrackedState();
const dispatch = useDispatch();
dispatch({ type: 'FOO', value: state.foo }); // This may lead unexpected behavior if state.foo is an object
dispatch({ type: 'FOO', value: state.fooStr }); // This is OK if state.fooStr is a string
```

## Blogs

- [A deadly simple React bindings library for Redux with Hooks API](https://blog.axlight.com/posts/a-deadly-simple-react-bindings-library-for-redux-with-hooks-api/)
- [Developing React custom hooks for Redux without react-redux](https://blog.axlight.com/posts/developing-react-custom-hooks-for-redux-without-react-redux/)
- [Integrating React and Redux, with Hooks and Proxies](https://frontarm.com/daishi-kato/redux-custom-hooks/)
- [New React Redux coding style with hooks without selectors](https://blog.axlight.com/posts/new-react-redux-coding-style-with-hooks-without-selectors/)
- [Benchmark alpha-released hooks API in React Redux with alternatives](https://blog.axlight.com/posts/benchmark-alpha-released-hooks-api-in-react-redux-with-alternatives/)
- [Four patterns for global state with React hooks: Context or Redux](https://blog.axlight.com/posts/four-patterns-for-global-state-with-react-hooks-context-or-redux/)
- [Redux meets hooks for non-redux users: a small concrete example with reactive-react-redux](https://blog.axlight.com/posts/redux-meets-hooks-for-non-redux-users-a-small-concrete-example-with-reactive-react-redux/)
- [Redux-less context-based useSelector hook that has same performance as React-Redux](https://blog.axlight.com/posts/benchmark-react-tracked/)
