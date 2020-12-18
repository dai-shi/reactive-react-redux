import { combineReducers } from 'redux';
import {
  SubredditPosts,
  SelectedSubreddit,
  PostsBySubreddit,
  State,
  Action,
} from './actions';

const selectedSubreddit = (
  state: SelectedSubreddit = 'reactjs',
  action: Action,
): SelectedSubreddit => {
  switch (action.type) {
    case 'SELECT_SUBREDDIT':
      return action.subreddit;
    default:
      return state;
  }
};

const posts = (state: SubredditPosts = {
  isFetching: false,
  didInvalidate: false,
  items: [],
}, action: Action): SubredditPosts => {
  switch (action.type) {
    case 'INVALIDATE_SUBREDDIT':
      return {
        ...state,
        didInvalidate: true,
      };
    case 'REQUEST_POSTS':
      return {
        ...state,
        isFetching: true,
        didInvalidate: false,
      };
    case 'RECEIVE_POSTS':
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt,
      };
    default:
      return state;
  }
};

const postsBySubreddit = (
  state: PostsBySubreddit = {},
  action: Action,
): PostsBySubreddit => {
  switch (action.type) {
    case 'INVALIDATE_SUBREDDIT':
    case 'RECEIVE_POSTS':
    case 'REQUEST_POSTS':
      return {
        ...state,
        [action.subreddit]: posts(state[action.subreddit], action),
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers<State, Action>({
  postsBySubreddit,
  selectedSubreddit,
});

export default rootReducer;
