import { useContext } from 'react';

import { ReduxStoreContext } from './provider';

export const useReduxDispatch = () => {
  const store = useContext(ReduxStoreContext);
  return store.dispatch;
};
