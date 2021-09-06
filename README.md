This project is no longer maintained.
[react-tracked](https://react-tracked.js.org) works with react-redux
and covers the use case of reactive-react-redux.
Redux docs officially recommends [proxy-memoize](https://redux.js.org/usage/deriving-data-selectors#proxy-memoize) as a selector library,
and it provides similar developer experience to that of reactive-react-redux.
Both are good options.

---

There are several projects related to this repo.
Here's the index of those.

- reactive-react-redux v5-alpha (this repo): This has an experimental react-redux binding with useMutableSource. It provides useTrackedState, which tracks the usage of state in render, and it's originally proposed in this repo.
- [react-tracked](https://github.com/dai-shi/react-tracked): This project is to provide useTrackedState with React Context. v1.6 provides createTrackedSelector that will create useTrackedState from useSelector.
- [react-redux #1503](https://github.com/reduxjs/react-redux/pull/1503): A pull request to add useTrackedState to the official react-redux library.
- [proxy-memoize](https://github.com/dai-shi/proxy-memoize): This is another project which is not tied to React, but combined with useSelector, we get a similar functionality like useTrackedState.

---

# reactive-react-redux

[![CI](https://img.shields.io/github/workflow/status/dai-shi/reactive-react-redux/CI)](https://github.com/dai-shi/reactive-react-redux/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/reactive-react-redux)](https://www.npmjs.com/package/reactive-react-redux)
[![size](https://img.shields.io/bundlephobia/minzip/reactive-react-redux)](https://bundlephobia.com/result?p=reactive-react-redux)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

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

### 2. useMutableSource without Context

react-redux v7 has APIs around Context.
This library is implemented with useMutableSource,
and it patches the Redux store.
APIs are provided without Context.
It's up to developers to use Context based on them.
Check out `./examples/11_todolist/src/context.ts`.

There's another difference from react-redux v7.
This library directly use useMutableSource, and requires
useCallback for the selector in useSelector.
[equalityFn](https://react-redux.js.org/api/hooks#equality-comparisons-and-updates) is not supported.

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
  patchStore,
  useTrackedState,
} from 'reactive-react-redux';

const initialState = {
  count: 0,
  text: 'hello',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'decrement': return { ...state, count: state.count - 1 };
    case 'setText': return { ...state, text: action.text };
    default: return state;
  }
};

const store = patchStore(createStore(reducer));

const Counter = () => {
  const state = useTrackedState(store);
  const { dispatch } = store;
  return (
    <div>
      {Math.random()}
      <div>
        <span>Count: {state.count}</span>
        <button type="button" onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button type="button" onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      </div>
    </div>
  );
};

const TextBox = () => {
  const state = useTrackedState(store);
  const { dispatch } = store;
  return (
    <div>
      {Math.random()}
      <div>
        <span>Text: {state.text}</span>
        <input value={state.text} onChange={event => dispatch({ type: 'setText', text: event.target.value })} />
      </div>
    </div>
  );
};

const App = () => (
  <>
    <h1>Counter</h1>
    <Counter />
    <Counter />
    <h1>TextBox</h1>
    <TextBox />
    <TextBox />
  </>
);
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### patchStore

patch Redux store for React

#### Parameters

-   `store` **Store&lt;State, Action>** 

#### Examples

```javascript
import { createStore } from 'redux';
import { patchStore } from 'reactive-react-redux';

const reducer = ...;
const store = patchStore(createStore(reducer));
```

### useTrackedState

useTrackedState hook

It return the Redux state wrapped by Proxy,
and the state prperty access is tracked.
It will only re-render if accessed properties are changed.

#### Parameters

-   `patchedStore` **PatchedStore&lt;State, Action>** 
-   `opts` **Opts**  (optional, default `{}`)

#### Examples

```javascript
import { useTrackedState } from 'reactive-react-redux';

const Component = () => {
  const state = useTrackedState(store);
  ...
};
```

### useSelector

useSelector hook

selector has to be stable. Either define it outside render
or use useCallback if selector uses props.

#### Parameters

-   `patchedStore` **PatchedStore&lt;State, Action>** 
-   `selector` **function (state: State): Selected** 

#### Examples

```javascript
import { useCallback } from 'react';
import { useSelector } from 'reactive-react-redux';

const Component = ({ count }) => {
  const isBigger = useSelector(store, useCallack(state => state.count > count, [count]));
  ...
};
```

### memo

memo

Using `React.memo` with tracked state is not compatible,
because `React.memo` stops state access, thus no tracking occurs.
This is a special memo to be used instead of `React.memo` with tracking support.

#### Parameters

-   `Component` **any** 
-   `areEqual` **any?** 

#### Examples

```javascript
import { memo } from 'reactive-react-redux';

const ChildComponent = memo(({ obj1, obj2 }) => {
  // ...
});
```

## Recipes

### Context

You can create Context based APIs like react-redux v7.

```typescript
import { createContext, createElement, useContext } from 'react';
import {
  PatchedStore,
  useSelector as useSelectorOrig,
  useTrackedState as useTrackedStateOrig,
} from 'reactive-react-redux';

export type State = ...;

export type Action = ...;

const Context = createContext(new Proxy({}, {
  get() { throw new Error('use Provider'); },
}) as PatchedStore<State, Action>);

export const Provider: React.FC<{ store: PatchedStore<State, Action> }> = ({
  store,
  children,
}) => createElement(Context.Provider, { value: store }, children);

export const useDispatch = () => useContext(Context).dispatch;

export const useSelector = <Selected>(
  selector: (state: State) => Selected,
) => useSelectorOrig(useContext(Context), selector);

export const useTrackedState = () => useTrackedStateOrig(useContext(Context));
```

### useTrackedSelector

You can create a selector hook with tracking support.

```javascript
import { useTrackedState } from 'reactive-react-redux';

export const useTrackedSelector = (patchedStore, selector) => selector(useTrackedState(patchedStore));
```

Please refer [this issue](https://github.com/dai-shi/reactive-react-redux/issues/41) for more information.

### useTracked

You can combine useTrackedState and useDispatch to
make a hook that returns a tuple like `useReducer`.

```javascript
import { useTrackedState, useDispatch } from 'reactive-react-redux';

export const useTracked = (patchedStore) => {
  const state = useTrackedState(patchedStore);
  const dispatch = useDispatch(patchedStore);
  return useMemo(() => [state, dispatch], [state, dispatch]);
};
```

## Caveats

Proxy and state usage tracking may not work 100% as expected.
There are some limitations and workarounds.

### Proxied states are referentially equal only in per-hook basis

```javascript
const state1 = useTrackedState(patchedStore);
const state2 = useTrackedState(patchedStore);
// state1 and state2 is not referentially equal
// even if the underlying redux state is referentially equal.
```

You should use `useTrackedState` only once in a component.

### An object referential change doesn't trigger re-render if an property of the object is accessed in previous render

```javascript
const state = useTrackedState(patchedStore);
const { foo } = state;
return <Child key={foo.id} foo={foo} />;

const Child = React.memo(({ foo }) => {
  // ...
};
// if foo doesn't change, Child won't render, so foo.id is only marked as used.
// it won't trigger Child to re-render even if foo is changed.
```

You need to use a special `memo` provided by this library.

```javascript
import { memo } from 'reactive-react-redux';

const Child = memo(({ foo }) => {
  // ...
};
```

### Proxied state might behave unexpectedly outside render

Proxies are basically transparent, and it should behave like normal objects.
However, there can be edge cases where it behaves unexpectedly.
For example, if you console.log a proxied value,
it will display a proxy wrapping an object.
Notice, it will be kept tracking outside render,
so any prorerty access will mark as used to trigger re-render on updates.

useTrackedState will unwrap a Proxy before wrapping with a new Proxy,
hence, it will work fine in usual use cases.
There's only one known pitfall: If you wrap proxied state with your own Proxy
outside the control of useTrackedState,
it might lead memory leaks, because useTrackedState
wouldn't know how to unwrap your own Proxy.

To work around such edge cases, the first option is to use primitive values.

```javascript
const state = useTrackedState(patchedStore);
const dispatch = useUpdate(patchedStore);
dispatch({ type: 'FOO', value: state.fooObj }); // Instead of using objects,
dispatch({ type: 'FOO', value: state.fooStr }); // Use primitives.
```

The second option is to use `getUntrackedObject`.

```javascript
import { getUntrackedObject } from 'react-tracked';
dispatch({ type: 'FOO', value: getUntrackedObject(state.fooObj) });
```

You could implement a special dispatch function to do this automatically.

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
PORT=8080 npm run examples:01_minimal
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
[11](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/11_todolist)
[12](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/12_async)
[13](https://codesandbox.io/s/github/dai-shi/reactive-react-redux/tree/master/examples/13_memo)

## Benchmarks

<img alt="benchmark result" src="https://user-images.githubusercontent.com/490574/61585382-405fae80-ab95-11e9-9f28-3b1a49dd1e5f.png" width="425" />

See [#32](https://github.com/dai-shi/reactive-react-redux/issues/32) for details.

## Blogs

-   [A deadly simple React bindings library for Redux with Hooks API](https://blog.axlight.com/posts/a-deadly-simple-react-bindings-library-for-redux-with-hooks-api/)
-   [Developing React custom hooks for Redux without react-redux](https://blog.axlight.com/posts/developing-react-custom-hooks-for-redux-without-react-redux/)
-   [Integrating React and Redux, with Hooks and Proxies](https://frontarm.com/daishi-kato/redux-custom-hooks/)
-   [New React Redux coding style with hooks without selectors](https://blog.axlight.com/posts/new-react-redux-coding-style-with-hooks-without-selectors/)
-   [Benchmark alpha-released hooks API in React Redux with alternatives](https://blog.axlight.com/posts/benchmark-alpha-released-hooks-api-in-react-redux-with-alternatives/)
-   [Four patterns for global state with React hooks: Context or Redux](https://blog.axlight.com/posts/four-patterns-for-global-state-with-react-hooks-context-or-redux/)
-   [Redux meets hooks for non-redux users: a small concrete example with reactive-react-redux](https://blog.axlight.com/posts/redux-meets-hooks-for-non-redux-users-a-small-concrete-example-with-reactive-react-redux/)
-   [Redux-less context-based useSelector hook that has same performance as React-Redux](https://blog.axlight.com/posts/benchmark-react-tracked/)
-   [What is state usage tracking? A novel approach to intuitive and performant global state with React hooks and Proxy](https://blog.axlight.com/posts/what-is-state-usage-tracking-a-novel-approach-to-intuitive-and-performant-api-with-react-hooks-and-proxy/)
-   [Effortless render optimization with state usage tracking with React hooks](https://blog.axlight.com/posts/effortless-render-optimization-with-state-usage-tracking-with-react-hooks/)
-   [How I developed a Concurrent Mode friendly library for React Redux](https://blog.axlight.com/posts/how-i-developed-a-concurrent-mode-friendly-library-for-react-redux/)
-   [React hooks-oriented Redux coding pattern without thunks and action creators](https://blog.axlight.com/posts/react-hooks-oriented-redux-coding-pattern-without-thunks-and-action-creators/)
