// eslint-disable-next-line spaced-comment
/// <reference types="react-dom/experimental" />

import React from 'react';
import { createRoot } from 'react-dom';
import { createStore } from 'redux';
import { patchStore } from 'reactive-react-redux';

import { Provider } from './context';
import { State, Action } from './store/actions';
import rootReducer from './store/reducers';
import App from './components/App';

const store = patchStore<State, Action>(createStore(rootReducer));

const ele = document.getElementById('app');
if (!ele) throw new Error('no app');
createRoot(ele).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
