import React, { StrictMode } from 'react';
import { createStore } from 'redux';

import { Provider } from 'reactive-react-redux';

import { reducer } from './state';

import Counter from './Counter';

const store = createStore(reducer);

const App = () => (
  <StrictMode>
    <Provider store={store}>
      <h1>Counter</h1>
      <Counter />
      <h1>Counter</h1>
      <Counter />
    </Provider>
  </StrictMode>
);

export default App;
