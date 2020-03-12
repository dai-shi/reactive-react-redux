import React, { StrictMode } from 'react';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { patchStore } from 'reactive-react-redux';

import {
  State,
  Action,
  Provider,
  reducer,
} from './state';

import Counter from './Counter';
import Person from './Person';

const store = patchStore<State, Action>(createStore(reducer, applyMiddleware(reduxThunk)));

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
