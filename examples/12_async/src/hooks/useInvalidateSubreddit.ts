import { useCallback } from 'react';

import { useDispatch } from '../context';

const useInvalidateSubreddit = () => {
  const dispatch = useDispatch();
  const invalidateSubreddit = useCallback((subreddit: string) => {
    dispatch({
      type: 'INVALIDATE_SUBREDDIT',
      subreddit,
    });
  }, [dispatch]);
  return invalidateSubreddit;
};

export default useInvalidateSubreddit;
