// src/pages/PostsListPage.js
import React from "react";
import { Link } from "react-router-dom"; // For navigation links
import { useGetPostsQuery } from "../redux/api/postsApiSlice"; // RTK Query hook to fetch all posts
import PostCard from "../components/posts/PostCard"; // Component to display a single post summary

function PostsListPage() {
  // Use the RTK Query hook to fetch all posts.
  // `data: posts` renames the fetched data, `isLoading` is true while fetching,
  // `isError` if an error occurred, and `error` holds the error details.
  const { data: posts, isLoading, isError, error } = useGetPostsQuery();

  // Show a loading message while posts are being fetched.
  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading posts...</p>
      </div>
    );
  }

  // Show an error message if there was a problem fetching posts.
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
      {" "}
      {/* Main container for the posts list page */}
      <div className="posts-list-header">
        {" "}
        {/* Header section with title and create post button */}
        <h1>All Agricultural Posts</h1>
        {/* Link to the page for creating a new post */}
        <Link to="/posts/create" className="button primary-button">
          + Create New Post
        </Link>
      </div>
      {posts && posts.length > 0 ? (
        <div className="posts-grid">
          {" "}
          {/* Grid layout for displaying post cards */}
          {/* Map through the posts array and render a PostCard for each post */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} /> // Pass each post's data to PostCard
          ))}
        </div>
      ) : (
        <p>No posts available yet. Be the first to create one!</p> // Message if no posts
      )}
    </div>
  );
}

export default PostsListPage;
