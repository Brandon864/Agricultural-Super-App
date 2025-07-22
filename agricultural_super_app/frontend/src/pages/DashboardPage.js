// agricultural_super_app/frontend/src/pages/DashboardPage.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetPostsQuery,
  useGetCommunitiesQuery,
} from "../redux/api/apiSlice";

function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  // --- CORRECTED: RTK Query hooks must be called UNCONDITIONALLY at the top level ---
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useGetPostsQuery();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useGetCommunitiesQuery();
  // --- END CORRECTED ---

  // Now, handle the redirect if not logged in. This check comes AFTER all hooks.
  if (!currentUser) {
    navigate("/login");
    return null; // Prevent rendering the rest of the component if redirecting
  }

  // Handle loading states for data *after* currentUser is confirmed
  if (postsLoading || communitiesLoading) {
    return (
      <div className="page-container">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Handle errors for data *after* currentUser is confirmed
  if (postsError || communitiesError) {
    return (
      <div className="page-container">
        <p className="error">
          Error loading dashboard data:{" "}
          {postsError?.data?.message ||
            communitiesError?.data?.message ||
            "An unexpected error occurred."}
        </p>
        {/* Optional: Add a link to login or refresh if the error is auth-related */}
        {postsError?.status === 401 || communitiesError?.status === 401 ? (
          <Link to="/login" className="button primary-button">
            Login
          </Link>
        ) : null}
      </div>
    );
  }

  // Defensive check: Ensure communities and community.members are arrays before filtering
  // Assuming community.members is an array of user IDs.
  const userCommunities =
    communities && Array.isArray(communities)
      ? communities.filter(
          (community) =>
            community.members &&
            Array.isArray(community.members) &&
            community.members.some((memberId) => memberId === currentUser.id)
        )
      : [];

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser.username}!</h1>
        <p>
          Your personalized hub for agricultural insights and community
          engagement.
        </p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h2>Latest Posts</h2>
          {posts && Array.isArray(posts) && posts.length > 0 ? (
            <ul className="dashboard-list">
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
          <h2>My Communities</h2>
          {userCommunities.length > 0 ? (
            <ul className="dashboard-list">
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
