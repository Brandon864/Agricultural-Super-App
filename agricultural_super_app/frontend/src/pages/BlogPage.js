import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost } from '../redux/features/postSlice';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';

function BlogPage() {
  const dispatch = useDispatch();
  const { posts, status, error } = useSelector(state => state.posts);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  const handleCreatePost = (postData) => {
    dispatch(createPost(postData));
  };

  return (
    <div className="container">
      <h1>Agricultural Blog</h1>
      {isAuthenticated && (
        <>
          <h2>Create New Post</h2>
          <PostForm onSubmit={handleCreatePost} status={status} />
        </>
      )}
      
      <h2>Latest Posts</h2>
      {status === 'loading' && <p>Loading posts...</p>}
      {error && <p className="error-message">Error: {error.message}</p>}
      <div className="posts-list">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && status === 'succeeded' && <p>No posts available yet. Be the first to post!</p>}
      </div>
    </div>
  );
}

export default BlogPage;
