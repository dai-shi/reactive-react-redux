import { useContext } from 'react';

import { defaultContext } from './provider';

export const useReduxDispatch = (opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const { dispatch } = useContext(customContext);
  return dispatch;
};
