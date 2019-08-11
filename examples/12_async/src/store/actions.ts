export type Post = {
  id: string;
  title: string;
};

export type SubredditPosts = {
  isFetching: boolean;
  didInvalidate: boolean;
  items: Post[];
  lastUpdated?: number;
};

export type PostsBySubreddit = {
  [subreddit: string]: SubredditPosts;
};

export type SelectedSubreddit = string;

export type State = {
  selectedSubreddit: SelectedSubreddit;
  postsBySubreddit: PostsBySubreddit;
};

type SelectSubredditAction = {
  type: 'SELECT_SUBREDDIT';
  subreddit: string;
};

type InvalidateSubredditAction = {
  type: 'INVALIDATE_SUBREDDIT';
  subreddit: string;
};

type RequestPostsAction = {
  type: 'REQUEST_POSTS';
  subreddit: string;
};

type ReceivePostsAction = {
  type: 'RECEIVE_POSTS';
  subreddit: string;
  posts: Post[];
  receivedAt: number;
};

export type Action =
  | SelectSubredditAction
  | InvalidateSubredditAction
  | RequestPostsAction
  | ReceivePostsAction;
