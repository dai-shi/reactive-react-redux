import { useContext } from 'react';

import { ReduxStoreContext } from './provider';

export const useReduxDispatch = () => {
  const { dispatch } = useContext(ReduxStoreContext);
  return dispatch;
};
