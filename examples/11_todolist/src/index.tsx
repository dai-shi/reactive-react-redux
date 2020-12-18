import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';

import { Provider } from './context';
import rootReducer from './reducers';
import App from './components/App';

const store = createStore(rootReducer);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
