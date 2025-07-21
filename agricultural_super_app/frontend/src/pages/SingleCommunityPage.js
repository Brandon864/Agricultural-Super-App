import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetSingleCommunityQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../redux/api/apiSlice";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function SingleCommunityPage() {
  const { communityId } = useParams();
  const { currentUser } = useAuth();
  const currentUserId = currentUser ? currentUser.id : null;

  const {
    data: community,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetSingleCommunityQuery(communityId);

  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] =
    useLeaveCommunityMutation();

  // Console logs for debugging
  console.log("Community data in SingleCommunityPage:", community);
  console.log("Current user ID:", currentUserId);
  console.log(
    "Is current user a member (from community data)?",
    community?.is_member
  );

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

  const handleJoinLeave = async () => {
    if (!currentUser) {
      alert("Please log in to join or leave communities.");
      return;
    }
    try {
      if (community.is_member) {
        await leaveCommunity(community.id).unwrap();
        alert(`You have left ${community.name}.`);
      } else {
        await joinCommunity(community.id).unwrap();
        alert(`You have joined ${community.name}!`);
      }
    } catch (err) {
      console.error("Failed to update membership:", err);
      alert(`Failed to update membership: ${err.data?.message || err.message}`);
    }
  };

  return (
    <div className="page-container single-community-page">
      <div className="community-detail-card">
        <h2>{community.name}</h2>
        <p className="community-description">
          {community.description || "No description provided."}
        </p>
        <div className="community-meta">
          <span>
            Created: {new Date(community.created_at).toLocaleDateString()}
          </span>
          <span>Members: {community.member_count}</span>
        </div>
        <div className="community-actions">
          {currentUser && (
            <button
              onClick={handleJoinLeave}
              className={`button ${
                community.is_member ? "secondary-button" : "primary-button"
              }`}
              disabled={isJoining || isLeaving}
            >
              {isJoining || isLeaving
                ? community.is_member
                  ? "Leaving..."
                  : "Joining..."
                : community.is_member
                ? "Leave Community"
                : "Join Community"}
            </button>
          )}
          <Link to="/communities" className="button tertiary-button">
            Back to Communities
          </Link>
        </div>

        <div className="community-content-section">
          <h3>Community Discussions</h3>
          <p>Discussions for this community will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default SingleCommunityPage;
