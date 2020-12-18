import React, { StrictMode } from 'react';
import { createStore } from 'redux';

import { reducer } from './state';
import { Provider } from './context';

import TodoList from './TodoList';

const store = createStore(reducer);

const App = () => (
  <StrictMode>
    <Provider store={store}>
      <TodoList />
    </Provider>
  </StrictMode>
);

export default App;
