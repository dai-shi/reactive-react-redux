import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

import { ReduxProvider } from 'react-hooks-easy-redux';

import { reducer } from './state';

import Counter from './Counter';
import Person from './Person';

const {
  // @ts-ignore
  unstable_ConcurrentMode: ConcurrentMode,
} = React;

const store = createStore(reducer, applyMiddleware(reduxThunk));

const App = () => (
  <ConcurrentMode>
    <ReduxProvider store={store}>
      <h1>Counter</h1>
      <Counter />
      <Counter />
      <h1>Person</h1>
      <Person />
      <Person />
    </ReduxProvider>
  </ConcurrentMode>
);

export default App;
