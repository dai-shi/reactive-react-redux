import { useCallback } from 'react';
import { useDispatch } from 'reactive-react-redux';
import { useStore } from '../index';

import { Action, State, Post } from '../store/actions';

const shouldFetchPosts = (state: State, subreddit: string) => {
  const posts = state.postsBySubreddit[subreddit];
  if (!posts) {
    return true;
  }
  if (posts.isFetching) {
    return false;
  }
  return posts.didInvalidate;
};

const extractPosts = (json: unknown): Post[] | null => {
  try {
    const posts: Post[] = (json as {
      data: {
        children: {
          data: {
            id: string;
            title: string;
          };
        }[];
      };
    }).data.children.map(child => child.data);
    // type check
    if (posts.every(post => (
      typeof post.id === 'string' && typeof post.title === 'string'
    ))) {
      return posts;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const useFetchPostsIfNeeded = () => {
  const dispatch = useDispatch<Action>();
  const store = useStore();
  const fetchPostsIfNeeded = useCallback(async (subreddit: string) => {
    if (!shouldFetchPosts(store.getState(), subreddit)) {
      return;
    }
    dispatch({
      type: 'REQUEST_POSTS',
      subreddit,
    });
    const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
    const json = await response.json();
    const posts = extractPosts(json);
    if (!posts) throw new Error('unexpected json format');
    dispatch({
      type: 'RECEIVE_POSTS',
      subreddit,
      posts,
      receivedAt: Date.now(),
    });
  }, [dispatch, store]);
  return fetchPostsIfNeeded;
};

export default useFetchPostsIfNeeded;
