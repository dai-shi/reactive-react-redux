import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { patchStore } from 'reactive-react-redux';

import { Provider } from './context';
import { State, Action } from './types';
import rootReducer from './reducers';
import App from './components/App';

const store = patchStore<State, Action>(createStore(rootReducer));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
