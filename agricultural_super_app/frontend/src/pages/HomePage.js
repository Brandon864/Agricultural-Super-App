import React from "react";
import { Link } from "react-router-dom";
import { useGetPostsQuery } from "../redux/api/postsApiSlice"; // Import the RTK Query hook
import PostCard from "../components/posts/PostCard"; // Import the PostCard component

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
      {/* Display login/register buttons only if there are no posts or initially */}
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
      <hr className="homepage-separator" /> {/* Visual separator */}
      <h2>Latest Agricultural Posts</h2>
      {posts && posts.length > 0 ? (
        <div className="posts-grid">
          {" "}
          {/* Apply styling for a grid layout */}
          {/* We'll display a subset of posts, e.g., the 5 most recent */}
          {posts.slice(0, 5).map(
            (
              post // Show only the 5 most recent posts
            ) => (
              <PostCard key={post.id} post={post} />
            )
          )}
        </div>
      ) : (
        <p>No posts available yet. Be the first to share your insights!</p>
      )}
      {/* Link to view all posts, if you have more than 5 */}
      {posts && posts.length > 5 && (
        <div className="view-all-posts-section">
          <Link to="/posts" className="button secondary-button">
            View All Posts
          </Link>
        </div>
      )}
    </div>
  );
}

export default HomePage;
