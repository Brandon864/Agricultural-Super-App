import React from "react";
import { Link } from "react-router-dom";
import { useGetPostsQuery } from "../redux/api/postsApiSlice";
import PostCard from "../components/posts/PostCard"; // Corrected import path

function PostsListPage() {
  const { data: posts, isLoading, isError, error } = useGetPostsQuery();

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <p className="error-message">
          Error loading posts: {error?.data?.message || error?.error}
        </p>
      </div>
    );
  }

  return (
    <div className="page-container posts-list-page">
      <div className="posts-list-header">
        <h1>All Agricultural Posts</h1>
        <Link to="/posts/create" className="button primary-button">
          + Create New Post
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p>No posts available yet. Be the first to create one!</p>
      )}
    </div>
  );
}

export default PostsListPage;
