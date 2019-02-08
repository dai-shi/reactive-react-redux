import * as React from 'react';
import { createStore } from 'redux';

import { ReduxProvider } from 'react-hooks-easy-redux';

import { reducer } from './state';

import Counter from './Counter';

const store = createStore(reducer);

const App = () => (
  <React.StrictMode>
    <ReduxProvider store={store}>
      <h1>Counter</h1>
      <Counter />
      <h1>Counter</h1>
      <Counter />
    </ReduxProvider>
  </React.StrictMode>
);

export default App;
