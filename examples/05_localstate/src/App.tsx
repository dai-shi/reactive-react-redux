import * as React from 'react';
import { createStore } from 'redux';

import { ReduxProvider } from 'react-hooks-easy-redux';

import { reducer } from './state';

import Counter from './Counter';

const {
  // @ts-ignore
  unstable_ConcurrentMode: ConcurrentMode,
} = React;

const store = createStore(reducer);

const App = () => (
  <ConcurrentMode>
    <ReduxProvider store={store}>
      <h1>Counter</h1>
      <Counter />
      <h1>Counter</h1>
      <Counter />
    </ReduxProvider>
  </ConcurrentMode>
);

export default App;
