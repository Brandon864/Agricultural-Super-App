// src/components/posts/PostList.js
import React from "react";
import PostCard from "./PostCard";
import { useGetPostsQuery } from "../../redux/api/apiSlice"; // Import the hook
import "../../App.css"; // For layout container

const PostList = () => {
  // Use the RTK Query hook to fetch data
  const {
    data: posts,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetPostsQuery();

  let content;

  if (isLoading) {
    content = <div className="loading-message">Loading posts...</div>;
  } else if (isSuccess) {
    if (posts && posts.length > 0) {
      content = (
        <div className="post-list-grid">
          {" "}
          {/* Use a grid for layout */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      );
    } else {
      content = <div className="no-content-message">No blog posts found.</div>;
    }
  } else if (isError) {
    content = (
      <div className="error-message">
        Error:{" "}
        {error?.data?.message || error?.message || "Failed to load posts"}
      </div>
    );
    console.error("Error fetching posts:", error);
  }

  return (
    <section className="post-list-section">
      <h2>Recent Agricultural Blogs</h2>
      {content}
    </section>
  );
};

export default PostList;
