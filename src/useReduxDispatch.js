import { useContext } from 'react';

import { defaultContext } from './ReduxProvider';

export const useReduxDispatch = (opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const { dispatch } = useContext(customContext);
  return dispatch;
};
