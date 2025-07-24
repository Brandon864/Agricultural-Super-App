// agricultural_super_app/frontend/src/pages/DashboardPage.js
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Hooks for navigation
import { useSelector } from "react-redux"; // Hook to get data from Redux store (for current user)
import {
  useGetPostsQuery, // RTK Query hook to fetch all posts
  useGetCommunitiesQuery, // RTK Query hook to fetch all communities
} from "../redux/api/apiSlice"; // Make sure these are defined in your apiSlice

function DashboardPage() {
  // Hook to navigate to different routes
  const navigate = useNavigate();
  // Get the current logged-in user from the Redux authentication state.
  const { currentUser } = useSelector((state) => state.auth);

  // --- IMPORTANT: RTK Query hooks must always be called unconditionally at the top level of the component. ---
  // Fetch all posts using RTK Query
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useGetPostsQuery();
  // Fetch all communities using RTK Query
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useGetCommunitiesQuery();
  // --- END OF HOOK DECLARATIONS ---

  // Now, after all hooks are called, handle the redirect if the user is not logged in.
  // This ensures hooks are always called in the same order, preventing React errors.
  if (!currentUser) {
    navigate("/login"); // Redirect to login page if user is not authenticated
    return null; // Don't render the dashboard content if redirecting
  }

  // Handle loading states for data *after* confirming the user is logged in.
  if (postsLoading || communitiesLoading) {
    return (
      <div className="page-container">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Handle errors for data *after* confirming the user is logged in.
  if (postsError || communitiesError) {
    return (
      <div className="page-container">
        <p className="error">
          Error loading dashboard data:{" "}
          {postsError?.data?.message || // Display backend error message for posts
            communitiesError?.data?.message || // Display backend error message for communities
            "An unexpected error occurred."}{" "}
          {/* Generic fallback error */}
        </p>
        {/* Optional: Provide a login link if the error might be due to an expired token */}
        {postsError?.status === 401 || communitiesError?.status === 401 ? (
          <Link to="/login" className="button primary-button">
            Login
          </Link>
        ) : null}
      </div>
    );
  }

  // Filter communities to show only those the current user is a member of.
  // We defensively check if `communities` and `community.members` are arrays.
  // Assumes `community.members` is an array of member IDs.
  const userCommunities =
    communities && Array.isArray(communities)
      ? communities.filter(
          (community) =>
            community.members &&
            Array.isArray(community.members) &&
            community.members.some((memberId) => memberId === currentUser.id)
        )
      : []; // Default to an empty array if no communities or invalid data

  return (
    <div className="page-container dashboard-page">
      {" "}
      {/* Main container for the dashboard */}
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser.username}!</h1>{" "}
        {/* Personalized welcome message */}
        <p>
          Your personalized hub for agricultural insights and community
          engagement.
        </p>
      </div>
      <div className="content-grid">
        {" "}
        {/* Grid layout for dashboard sections */}
        <div className="card">
          {" "}
          {/* Card for Latest Posts */}
          <h2>Latest Posts</h2>
          {posts && Array.isArray(posts) && posts.length > 0 ? (
            <ul className="dashboard-list">
              {/* Display up to 5 latest posts */}
              {posts.slice(0, 5).map((post) => (
                <li key={post.id}>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link> - by{" "}
                  {post.author_username || "Unknown"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available yet. Be the first to create one!</p>
          )}
          <Link to="/posts" className="button secondary-button">
            View All Posts
          </Link>
        </div>
        <div className="card">
          {" "}
          {/* Card for My Communities */}
          <h2>My Communities</h2>
          {userCommunities.length > 0 ? (
            <ul className="dashboard-list">
              {/* Display up to 5 communities the user has joined */}
              {userCommunities.slice(0, 5).map((community) => (
                <li key={community.id}>
                  <Link to={`/communities/${community.id}`}>
                    {community.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't joined any communities yet. Join or create one!</p>
          )}
          <Link to="/communities" className="button primary-button">
            Explore Communities
          </Link>
        </div>
        <div className="card">
          {" "}
          {/* Card for Quick Links */}
          <h2>Quick Links</h2>
          <ul className="dashboard-list">
            <li>
              <Link to="/posts/create" className="nav-link">
                Create a New Post
              </Link>
            </li>
            <li>
              <Link to="/communities/create" className="nav-link">
                Create a New Community
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link">
                Update My Profile
              </Link>
            </li>
            <li>
              <Link to="/marketplace" className="nav-link">
                Visit Marketplace
              </Link>
            </li>
            <li>
              <Link to="/upload-image" className="nav-link">
                Upload Image
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
