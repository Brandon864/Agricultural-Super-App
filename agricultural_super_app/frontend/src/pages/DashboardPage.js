// agricultural_super_app/frontend/src/pages/DashboardPage.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGetPostsQuery } from "../redux/api/postsApiSlice";
import { useGetCommunitiesQuery } from "../redux/api/communitiesApiSlice";

function DashboardPage() {
  const { currentUser, isLoading: authLoading, error: authError } = useAuth();

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

  if (authLoading || postsLoading || communitiesLoading) {
    return (
      <div className="page-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="page-container">
        <p className="error">
          Authentication error: {authError.message || "Please log in again."}
        </p>
        <Link to="/login" className="button primary-button">
          Login
        </Link>
      </div>
    );
  }

  if (postsError || communitiesError) {
    return (
      <div className="page-container">
        <p className="error">Error loading dashboard data.</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page-container">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  // Defensive check: Ensure communities and community.members are arrays before filtering
  const userCommunities =
    communities && Array.isArray(communities)
      ? communities.filter(
          (community) =>
            community.members && Array.isArray(community.members) // Ensure community.members is an array
              ? community.members.some(
                  (memberId) => memberId === currentUser.id
                ) // Compare with memberId directly
              : false // If members is not an array, this community doesn't match
        )
      : []; // Default to empty array if communities is not an array or null

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
          {posts && Array.isArray(posts) && posts.length > 0 ? ( // Added Array.isArray check
            <ul className="dashboard-list">
              {posts.slice(0, 5).map((post) => (
                <li key={post.id}>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link> - by{" "}
                  {post.author_username}
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available yet. Be the first to create one!</p>
          )}
          <Link to="/posts" className="button secondary-button">
            View All Posts (placeholder)
          </Link>
        </div>

        <div className="card">
          <h2>My Communities</h2>
          {userCommunities.length > 0 ? ( // userCommunities is already an array due to default []
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
                Visit Marketplace (placeholder)
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
