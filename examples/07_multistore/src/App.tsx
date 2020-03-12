import React, { useState, StrictMode } from 'react';
import { createStore } from 'redux';
import { patchStore } from 'reactive-react-redux';

import {
  State,
  Action,
  Provider,
  reducer,
} from './state';

import Counter from './Counter';
import Person from './Person';

const store1 = patchStore<State, Action>(createStore(reducer));
const store2 = patchStore<State, Action>(createStore(reducer));

const App = () => {
  const [store, setStore] = useState(store1);
  return (
    <StrictMode>
      <div>
        <button type="button" onClick={() => setStore(store1)}>store1</button>
        <button type="button" onClick={() => setStore(store2)}>store2</button>
        <Provider store={store}>
          <h1>Counter</h1>
          <Counter />
          <Counter />
          <h1>Person</h1>
          <Person />
          <Person />
        </Provider>
      </div>
    </StrictMode>
  );
};

export default App;
