import React, { StrictMode } from 'react';
import { createStore } from 'redux';

import { reducer } from './state';
import { Provider } from './context';

import Counter from './Counter';
import Person from './Person';

const store = createStore(reducer);

const App = () => (
  <StrictMode>
    <Provider store={store}>
      <h1>Counter</h1>
      <Counter />
      <Counter />
      <h1>Person</h1>
      <Person />
      <Person />
    </Provider>
  </StrictMode>
);

export default App;
