import React, { StrictMode } from 'react';
import { createStore } from 'redux';

import { Provider } from 'reactive-react-redux';

import { reducer } from './state';

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
