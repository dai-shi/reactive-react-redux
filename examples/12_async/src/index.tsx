// eslint-disable-next-line spaced-comment
/// <reference types="react-dom/experimental" />

import React from 'react';
import { unstable_createRoot as createRoot } from 'react-dom';
import { createStore } from 'redux';

import { Provider } from './context';
import rootReducer from './store/reducers';
import App from './components/App';

const store = createStore(rootReducer);

const ele = document.getElementById('app');
if (!ele) throw new Error('no app');
createRoot(ele).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
