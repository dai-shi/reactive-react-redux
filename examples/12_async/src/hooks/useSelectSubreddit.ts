import { useCallback } from 'react';
import { useDispatch } from 'reactive-react-redux';

import { Action } from '../store/actions';

const useSelectSubreddit = () => {
  const dispatch = useDispatch<Action>();
  const selectSubreddit = useCallback((subreddit: string) => {
    dispatch({
      type: 'SELECT_SUBREDDIT',
      subreddit,
    });
  }, [dispatch]);
  return selectSubreddit;
};

export default useSelectSubreddit;
