import { useCallback } from 'react';
import { useDispatch } from 'reactive-react-redux';

import { Action } from '../store/actions';

const useInvalidateSubreddit = () => {
  const dispatch = useDispatch<Action>();
  const invalidateSubreddit = useCallback((subreddit: string) => {
    dispatch({
      type: 'INVALIDATE_SUBREDDIT',
      subreddit,
    });
  }, [dispatch]);
  return invalidateSubreddit;
};

export default useInvalidateSubreddit;
