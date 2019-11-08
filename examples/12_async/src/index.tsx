import React, { createContext, useContext } from 'react';
import {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  createRoot,
} from 'react-dom';
import { Provider } from 'reactive-react-redux';
import { createStore } from 'redux';

import rootReducer from './store/reducers';
import App from './components/App';

const store = createStore(rootReducer);

const StoreContext = createContext(store);
export const useStore = () => useContext(StoreContext);

const ele = document.getElementById('app');
if (!ele) throw new Error('no app');
createRoot(ele).render(
  <StoreContext.Provider value={store}>
    <Provider store={store}>
      <App />
    </Provider>
  </StoreContext.Provider>,
);
