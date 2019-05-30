import * as React from 'react';
import { StrictMode } from 'react';
import { createStore } from 'redux';

import { ReduxProvider } from 'reactive-react-redux';

import { reducer } from './state';

import Counter from './Counter';

const store = createStore(reducer);

const App = () => (
  <StrictMode>
    <ReduxProvider store={store}>
      <h1>Counter</h1>
      <Counter />
      <h1>Counter</h1>
      <Counter />
    </ReduxProvider>
  </StrictMode>
);

export default App;
