// src/components/UserSearch.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../redux/api/apiSlice";
import { useSelector } from "react-redux";
import "../App.css"; // Ensure App.css is imported for the new styles

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useSelector((state) => state.auth);

  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    error,
  } = useSearchUsersQuery(searchTerm, {
    skip: !searchTerm.trim(),
  });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    try {
      if (!currentUser) {
        // Added check for logged-in user
        alert("You must be logged in to follow or unfollow users.");
        return;
      }
      if (isCurrentlyFollowing) {
        await unfollowUser(userId).unwrap();
        alert("Unfollowed!");
      } else {
        await followUser(userId).unwrap();
        alert("Followed!");
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      alert(
        `Failed to ${isCurrentlyFollowing ? "unfollow" : "follow"} user: ${
          err.data?.message || err.error
        }`
      );
    }
  };

  const displayUsers = searchResults || [];

  return (
    <div className="user-search-page-container page-container">
      {" "}
      {/* Consistent page-container */}
      <h2 className="user-search-title">Find People to Follow</h2>
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input input-field" // Reused input-field for consistency
        />
        <button
          type="submit"
          className="search-button button primary-button" // Reused button and primary-button
        >
          Search
        </button>
      </div>
      {(isLoading || isFetching) && (
        <p className="loading-message">Searching...</p>
      )}
      {isError && (
        <p className="error-message">
          Error: {error?.data?.message || "Failed to search users."}
        </p>
      )}
      {searchTerm.trim() &&
        displayUsers.length === 0 &&
        !(isLoading || isFetching) &&
        !isError && (
          <p className="info-message">No users found for "{searchTerm}".</p>
        )}
      {displayUsers.length > 0 && (
        <ul className="user-list-grid">
          {displayUsers.map((user) => (
            <li
              key={user.id}
              className="user-list-item card" // Reused card class
            >
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={`${user.username}'s profile`}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar user-avatar-placeholder">
                  No Img
                </div>
              )}
              <div className="user-info">
                <Link to={`/users/${user.id}`} className="user-name-link">
                  {user.username}
                </Link>
                <p className="user-bio">{user.bio || "No bio."}</p>
              </div>
              {currentUser && currentUser.id !== user.id && (
                <button
                  onClick={() =>
                    handleFollowToggle(
                      user.id,
                      user.is_followed_by_current_user
                    )
                  }
                  className={`follow-button ${
                    user.is_followed_by_current_user
                      ? "unfollow-style"
                      : "follow-style"
                  } button`} // Reused button class
                >
                  {user.is_followed_by_current_user ? "Unfollow" : "Follow"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserSearch;
