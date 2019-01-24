import * as React from 'react';
import { createStore } from 'redux';

import { ReduxProvider } from 'react-hooks-easy-redux';

import { reducer } from './state';

import Counter from './Counter';
import Person from './Person';

const { useState } = React;

const store1 = createStore(reducer);
const store2 = createStore(reducer);

const App = () => {
  const [store, setStore] = useState(store1);
  return (
    <div>
      <button type="button" onClick={() => setStore(store1)}>store1</button>
      <button type="button" onClick={() => setStore(store2)}>store2</button>
      <ReduxProvider store={store}>
        <h1>Counter</h1>
        <Counter />
        <Counter />
        <h1>Person</h1>
        <Person />
        <Person />
      </ReduxProvider>
    </div>
  );
};

export default App;
