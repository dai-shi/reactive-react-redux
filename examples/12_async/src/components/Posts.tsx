import React from 'react';

const Posts: React.FC<{
  posts: {
    id: string;
    title: string;
  }[];
}> = ({ posts }) => (
  <ul>
    {posts.map((post) => (
      <li key={post.id}>{post.title}</li>
    ))}
  </ul>
);

export default Posts;
