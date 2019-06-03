import * as React from 'react';
import { render } from 'react-dom';
import { ReduxProvider } from 'reactive-react-redux';
import { createStore } from 'redux';

import rootReducer from './reducers';
import App from './components/App';

const store = createStore(rootReducer);

render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  document.getElementById('app'),
);
