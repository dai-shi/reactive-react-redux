import * as React from 'react';
import { StrictMode } from 'react';
import { createStore } from 'redux';

import { ReduxProvider } from 'reactive-react-redux';

import { reducer } from './state';

import Counter from './Counter';
import Person from './Person';

const store = createStore(reducer);

const App = () => (
  <StrictMode>
    <ReduxProvider store={store}>
      <h1>Counter</h1>
      <Counter />
      <Counter />
      <h1>Person</h1>
      <Person />
      <Person />
    </ReduxProvider>
  </StrictMode>
);

export default App;
