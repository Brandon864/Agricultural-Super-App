// src/pages/SingleCommunityPage.js
import React from "react";
import { useParams, Link } from "react-router-dom"; // Hooks for URL parameters and navigation links
import {
  useGetSingleCommunityQuery, // RTK Query hook to fetch single community details
  useJoinCommunityMutation, // RTK Query hook for joining a community
  useLeaveCommunityMutation, // RTK Query hook for leaving a community
} from "../redux/api/apiSlice"; // Assuming these are defined in your apiSlice
import { useAuth } from "../context/AuthContext"; // Custom hook to access authentication context (currentUser)
import "../App.css"; // Ensure global styles are imported

function SingleCommunityPage() {
  // Get the 'communityId' parameter from the URL (e.g., /communities/:communityId)
  const { communityId } = useParams();
  // Get the current logged-in user from your authentication context
  const { currentUser } = useAuth();
  // Extract current user's ID for checks (e.g., if they are a member)
  const currentUserId = currentUser ? currentUser.id : null;

  // RTK Query hook to fetch the specific community's data.
  const {
    data: community,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetSingleCommunityQuery(communityId);

  // RTK Query mutation hooks for joining and leaving a community.
  // `isJoining` and `isLeaving` track the loading state for these mutations.
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] =
    useLeaveCommunityMutation();

  // Console logs for debugging (can be removed in production)
  console.log("Community data in SingleCommunityPage:", community);
  console.log("Current user ID:", currentUserId);
  console.log(
    "Is current user a member (from community data)?",
    community?.is_member
  );

  // --- Conditional Rendering for Loading/Error States ---
  if (isLoading) {
    return <div className="page-container">Loading community details...</div>;
  }

  if (isError) {
    return (
      <div className="page-container error-message">
        Error loading community:{" "}
        {error?.data?.message || "Community not found or something went wrong."}
      </div>
    );
  }

  if (!community) {
    return <div className="page-container">Community not found.</div>;
  }

  // Function to handle joining or leaving a community
  const handleJoinLeave = async () => {
    // Alert if user is not logged in
    if (!currentUser) {
      alert("Please log in to join or leave communities.");
      return;
    }
    try {
      // Check `community.is_member` property (which should be provided by your API response)
      if (community.is_member) {
        await leaveCommunity(community.id).unwrap(); // Call leave mutation
        alert(`You have left ${community.name}.`);
      } else {
        await joinCommunity(community.id).unwrap(); // Call join mutation
        alert(`You have joined ${community.name}!`);
      }
    } catch (err) {
      console.error("Failed to update membership:", err);
      alert(`Failed to update membership: ${err.data?.message || err.message}`);
    }
  };

  return (
    <div className="page-container single-community-page">
      {" "}
      {/* Main container for the single community page */}
      <div className="community-detail-card">
        {" "}
        {/* Card for community details */}
        <h2>{community.name}</h2> {/* Community name */}
        <p className="community-description">
          {community.description || "No description provided."}{" "}
          {/* Community description */}
        </p>
        <div className="community-meta">
          {" "}
          {/* Metadata like creation date and member count */}
          <span>
            Created: {new Date(community.created_at).toLocaleDateString()}
          </span>
          <span>Members: {community.member_count}</span>
        </div>
        <div className="community-actions">
          {" "}
          {/* Action buttons (Join/Leave, Back) */}
          {currentUser && ( // Only show join/leave button if a user is logged in
            <button
              onClick={handleJoinLeave}
              // Dynamically apply button style based on membership status
              className={`button ${
                community.is_member ? "secondary-button" : "primary-button"
              }`}
              disabled={isJoining || isLeaving} // Disable button while mutation is in progress
            >
              {isJoining || isLeaving // Show loading text while mutating
                ? community.is_member
                  ? "Leaving..."
                  : "Joining..."
                : community.is_member // Show "Leave" or "Join" based on current membership
                ? "Leave Community"
                : "Join Community"}
            </button>
          )}
          <Link to="/communities" className="button tertiary-button">
            Back to Communities
          </Link>
        </div>
        <div className="community-content-section">
          {" "}
          {/* Section for community-specific content like discussions */}
          <h3>Community Discussions</h3>
          <p>Discussions for this community will appear here.</p>{" "}
          {/* Placeholder */}
        </div>
      </div>
    </div>
  );
}

export default SingleCommunityPage;
