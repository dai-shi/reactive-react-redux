import { useCallback } from 'react';

import { useDispatch } from '../context';

const useSelectSubreddit = () => {
  const dispatch = useDispatch();
  const selectSubreddit = useCallback((subreddit: string) => {
    dispatch({
      type: 'SELECT_SUBREDDIT',
      subreddit,
    });
  }, [dispatch]);
  return selectSubreddit;
};

export default useSelectSubreddit;
