import * as React from 'react';
import { createContext, useContext } from 'react';
import {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  unstable_createRoot as createRoot,
} from 'react-dom';
import { Provider } from 'reactive-react-redux';
import { createStore } from 'redux';

import rootReducer from './store/reducers';
import App from './components/App';

const store = createStore(rootReducer);

const StoreContext = createContext(store);
export const useStore = () => useContext(StoreContext);

createRoot(document.getElementById('app')).render(
  <StoreContext.Provider value={store}>
    <Provider store={store}>
      <App />
    </Provider>
  </StoreContext.Provider>,
);
