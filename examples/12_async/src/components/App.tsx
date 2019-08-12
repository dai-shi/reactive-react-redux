import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'reactive-react-redux';

import { State, SelectedSubreddit } from '../store/actions';
import useSelectSubreddit from '../hooks/useSelectSubreddit';
import useFetchPostsIfNeeded from '../hooks/useFetchPostsIfNeeded';
import useInvalidateSubreddit from '../hooks/useInvalidateSubreddit';

import Picker from './Picker';
import Posts from './Posts';

const App: React.FC = () => {
  const selectedSubreddit = useSelector((state: State) => state.selectedSubreddit);
  const postsBySubreddit = useSelector((state: State) => state.postsBySubreddit);
  const {
    isFetching,
    items: posts,
    lastUpdated,
  } = postsBySubreddit[selectedSubreddit] || {
    isFetching: true,
    items: [],
    lastUpdated: undefined,
  };

  const fetchPostsIfNeeded = useFetchPostsIfNeeded();
  useEffect(() => {
    fetchPostsIfNeeded(selectedSubreddit);
  }, [fetchPostsIfNeeded, selectedSubreddit]);

  const selectSubreddit = useSelectSubreddit();
  const handleChange = useCallback((nextSubreddit: SelectedSubreddit) => {
    selectSubreddit(nextSubreddit);
  }, [selectSubreddit]);

  const invalidateSubreddit = useInvalidateSubreddit();
  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    invalidateSubreddit(selectedSubreddit);
    fetchPostsIfNeeded(selectedSubreddit);
  };

  const isEmpty = posts.length === 0;
  return (
    <div>
      <Picker
        value={selectedSubreddit}
        onChange={handleChange}
        options={['reactjs', 'frontend']}
      />
      <p>
        {lastUpdated && (
          <span>
            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
            {' '}
          </span>
        )}
        {!isFetching && (
          <button type="button" onClick={handleRefreshClick}>
            Refresh
          </button>
        )}
      </p>
      {isEmpty && isFetching && <h2>Loading...</h2>}
      {isEmpty && !isFetching && <h2>Empty.</h2>}
      {!isEmpty && (
        <div style={{ opacity: isFetching ? 0.5 : 1 }}>
          <Posts posts={posts} />
        </div>
      )}
    </div>
  );
};

export default App;
