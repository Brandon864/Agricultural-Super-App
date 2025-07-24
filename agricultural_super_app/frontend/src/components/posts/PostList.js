// src/components/posts/PostList.js
import React from "react";
import PostCard from "./PostCard";
import { useGetPostsQuery } from "../../redux/api/apiSlice"; // Import the RTK Query hook
import "../../App.css"; // Ensure App.css is imported for layout container

const PostList = () => {
  // Use the RTK Query hook to fetch data from the /api/posts endpoint
  const {
    data: posts, // Renames the fetched data to 'posts'
    isLoading, // True while the data is being fetched
    isSuccess, // True if the data was fetched successfully
    isError, // True if an error occurred during fetching
    error, // The error object if isError is true
  } = useGetPostsQuery();

  let content; // Variable to hold the content to be rendered

  if (isLoading) {
    // Display a loading message while data is being fetched
    content = <div className="loading-message">Loading posts...</div>;
  } else if (isSuccess) {
    // If data fetching was successful
    if (posts && posts.length > 0) {
      // If there are posts, map over them and render a PostCard for each
      content = (
        <div className="post-list-grid">
          {" "}
          {/* Apply grid layout styles */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} /> // Pass post data to PostCard
          ))}
        </div>
      );
    } else {
      // If no posts are found, display a message
      content = <div className="no-content-message">No blog posts found.</div>;
    }
  } else if (isError) {
    // If an error occurred, display an error message
    content = (
      <div className="error-message">
        Error:{" "}
        {error?.data?.message || error?.message || "Failed to load posts"}
      </div>
    );
    // Log the full error for debugging purposes
    console.error("Error fetching posts:", error);
  }

  return (
    <section className="post-list-section">
      {" "}
      {/* Section for the post list */}
      <h2>Recent Agricultural Blogs</h2>
      {content} {/* Render the dynamically generated content */}
    </section>
  );
};

export default PostList;
