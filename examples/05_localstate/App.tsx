import * as React from 'react';
import { createStore } from 'redux';

import { ReduxProvider } from '../../src/index';

import { reducer } from './state';

import Counter from './Counter';

const store = createStore(reducer);

const App = () => (
  <ReduxProvider store={store}>
    <h1>Counter</h1>
    <Counter />
    <h1>Counter</h1>
    <Counter />
  </ReduxProvider>
);

export default App;
