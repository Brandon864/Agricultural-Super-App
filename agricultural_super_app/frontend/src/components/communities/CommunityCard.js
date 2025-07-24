// src/components/communities/CommunityCard.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../../redux/api/apiSlice";
import "../../App.css";

function CommunityCard({ community }) {
  const navigate = useNavigate();

  if (!community) {
    console.warn("CommunityCard received a null or undefined community prop.");
    return null;
  }

  const { currentUser } = useSelector((state) => state.auth);
  const [joinCommunity] = useJoinCommunityMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();

  const isMember =
    currentUser &&
    community.members &&
    Array.isArray(community.members) &&
    community.members.includes(currentUser.id);

  const handleJoinLeave = async () => {
    if (!currentUser) {
      alert("Please log in to join or leave a community.");
      return;
    }

    if (isMember) {
      try {
        console.log("Attempting to leave community:", community.id);
        await leaveCommunity(community.id).unwrap();
        console.log("Successfully left community:", community.id);
        // Optional: If you want to redirect after leaving (e.g., to all communities)
        // navigate('/communities');
      } catch (error) {
        console.error("Failed to leave community:", error);
        alert("Failed to leave community. Please try again.");
      }
    } else {
      // This is the 'join' block we're testing!
      try {
        console.log("Attempting to join community:", community.id);
        // Await the join mutation and unwrap the result
        await joinCommunity(community.id).unwrap();
        console.log("Successfully joined community:", community.id);

        // Define target path for navigation
        const targetPath = `/communities/${community.id}`;
        console.log("Navigating to:", targetPath);

        // Perform the navigation
        navigate(targetPath);
      } catch (error) {
        console.error("Failed to join community or navigation error:", error);
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          error.status === 409
        ) {
          alert("You are already a member of this community!");
        } else {
          alert("Failed to join community. Please try again.");
        }
      }
    }
  };

  return (
    <div className="community-card">
      <Link
        to={`/communities/${community.id}`}
        className="community-title-link"
      >
        <h3>{community.name}</h3>
      </Link>
      <p className="community-description">{community.description}</p>
      <div className="community-meta">
        <span>Members: {community.members ? community.members.length : 0}</span>
        <span>
          Created: {new Date(community.created_at).toLocaleDateString()}
        </span>
      </div>
      {currentUser && (
        <button
          onClick={handleJoinLeave}
          className={`button ${
            isMember ? "secondary-button" : "primary-button"
          }`}
        >
          {isMember ? "Leave Community" : "Join Community"}
        </button>
      )}
    </div>
  );
}

export default CommunityCard;
