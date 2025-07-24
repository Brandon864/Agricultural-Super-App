// src/pages/BlogPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import hooks from React Redux
import { fetchPosts, createPost } from "../redux/features/postSlice"; // Import Redux actions
import PostCard from "../components/posts/PostCard"; // Component to display a single post
import PostForm from "../components/posts/PostForm"; // Component for creating a new post

function BlogPage() {
  // Get the dispatch function to send actions to the Redux store
  const dispatch = useDispatch();
  // Select data from the Redux store: posts array, loading status, and any error
  const { posts, status, error } = useSelector((state) => state.posts);
  // Check if the user is authenticated from the auth slice
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // useEffect hook to fetch posts when the component mounts or status changes
  useEffect(() => {
    // Only fetch posts if the status is 'idle' (meaning no request has been made yet)
    if (status === "idle") {
      dispatch(fetchPosts()); // Dispatch the action to fetch posts from the API
    }
  }, [status, dispatch]); // Dependencies: re-run if 'status' or 'dispatch' changes

  // Function to handle creating a new post. It dispatches the createPost action.
  const handleCreatePost = (postData) => {
    dispatch(createPost(postData));
  };

  return (
    <div className="container">
      {" "}
      {/* Main container for the page content */}
      <h1>Agricultural Blog</h1>
      {/* Conditionally render the "Create New Post" section if the user is authenticated */}
      {isAuthenticated && (
        <>
          <h2>Create New Post</h2>
          {/* PostForm component for creating new posts */}
          {/* onSubmit prop passes the handleCreatePost function */}
          {/* status prop helps PostForm show loading/error states for post creation */}
          <PostForm onSubmit={handleCreatePost} status={status} />
        </>
      )}
      <h2>Latest Posts</h2>
      {/* Show loading message while posts are being fetched */}
      {status === "loading" && <p>Loading posts...</p>}
      {/* Show error message if an error occurred during fetching */}
      {error && <p className="error-message">Error: {error.message}</p>}
      <div className="posts-list">
        {" "}
        {/* Container for displaying the list of posts */}
        {/* Map through the posts array and render a PostCard for each post */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} /> // Pass each post's data to PostCard
        ))}
        {/* Show a message if no posts are available after successful loading */}
        {posts.length === 0 && status === "succeeded" && (
          <p>No posts available yet. Be the first to post!</p>
        )}
      </div>
    </div>
  );
}

export default BlogPage;
