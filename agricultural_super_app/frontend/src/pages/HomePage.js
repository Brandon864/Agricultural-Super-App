// agricultural_super_app/frontend/src/pages/HomePage.js
import React from "react";
import { Link } from "react-router-dom";
import { useGetPostsQuery } from "../redux/api/postsApiSlice";
import PostCard from "../components/posts/PostCard";
import "../App.css"; // Ensure App.css is imported for custom styles

function HomePage() {
  const { data: posts, isLoading, isError, error } = useGetPostsQuery();

  if (isLoading) {
    return (
      <div className="page-container homepage-container">
        <h1>Welcome to the Agricultural Super App!</h1>
        <p>Loading the latest posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container homepage-container">
        <h1>Welcome to the Agricultural Super App!</h1>
        <p className="error-message">
          Error loading posts: {error?.data?.message || error?.error}
        </p>
        <div className="homepage-buttons">
          <Link to="/register" className="button primary-button">
            Join Us
          </Link>
          <Link to="/login" className="button secondary-button">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container homepage-container">
      <h1>Welcome to the Agricultural Super App!</h1>
      <p>
        Your all-in-one platform for connecting with the agricultural community,
        sharing knowledge, and staying updated on the latest trends and
        resources.
      </p>
      {(!posts || posts.length === 0) && (
        <div className="homepage-buttons">
          <Link to="/register" className="button primary-button">
            Join Us
          </Link>
          <Link to="/login" className="button secondary-button">
            Login
          </Link>
        </div>
      )}
      <hr className="homepage-separator" />
      {/* NEW WRAPPER DIV for "Latest Agricultural Posts" section */}
      <section className="latest-posts-section">
        <h2>Latest Agricultural Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="posts-grid">
            {posts.slice(0, 5).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p>No posts available yet. Be the first to share your insights!</p>
        )}
        {posts && posts.length > 5 && (
          <div className="view-all-posts-section">
            <Link to="/posts" className="button secondary-button">
              View All Posts
            </Link>
          </div>
        )}
      </section>{" "}
      {/* End of NEW WRAPPER DIV */}
    </div>
  );
}

export default HomePage;
