// src/pages/UserDetailPage.js
import React from "react";
import { useParams } from "react-router-dom"; // 'Link' is removed as it's not used directly here
import { useSelector } from "react-redux";
import {
  useGetUserQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../redux/api/apiSlice";
import UserListFilter from "../components/UserListFilter";

function UserDetailPage() {
  const { userId } = useParams();
  const currentUserId = useSelector((state) => state.auth.currentUser?.id);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetUserQuery(userId);

  const {
    data: followers,
    isLoading: isFollowersLoading,
    isError: isFollowersError, // No longer unused, will be used in error message
    error: followersError, // No longer unused
  } = useGetFollowersQuery(userId);

  const {
    data: following,
    isLoading: isFollowingLoading,
    isError: isFollowingError, // No longer unused
    error: followingError, // No longer unused
  } = useGetFollowingQuery(userId);

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollowToggle = async () => {
    const isAlreadyFollowing = user?.is_followed_by_current_user;

    try {
      if (isAlreadyFollowing) {
        await unfollowUser(userId).unwrap();
        alert(`Successfully unfollowed ${user.username}`);
      } else {
        await followUser(userId).unwrap();
        alert(`Successfully followed ${user.username}`);
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      alert(
        `Failed to ${isAlreadyFollowing ? "unfollow" : "follow"}: ${
          err.data?.message || err.error
        }`
      );
    }
  };

  if (isUserLoading || isFollowersLoading || isFollowingLoading) {
    return (
      <div className="page-container text-center">
        <p className="loading-message">Loading user profile...</p>
      </div>
    );
  }

  // Consolidated error handling to utilize all error states
  if (isUserError || isFollowersError || isFollowingError || !user) {
    let errorMessage =
      "Error loading user profile. User not found or network issue.";
    if (userError)
      errorMessage += ` User details: ${
        userError?.data?.message || userError?.error
      }`;
    if (followersError)
      errorMessage += ` Followers: ${
        followersError?.data?.message || followersError?.error
      }`;
    if (followingError)
      errorMessage += ` Following: ${
        followingError?.data?.message || followingError?.error
      }`;

    return (
      <div className="page-container text-center">
        <p className="error text-red-500">{errorMessage}</p>
      </div>
    );
  }

  const isOwnProfile =
    currentUserId && parseInt(currentUserId) === parseInt(userId);

  return (
    <div className="user-detail-page container mx-auto p-4">
      <div className="profile-card bg-white p-6 rounded shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-4">
          {user.username}'s Profile
          {isOwnProfile && (
            <span className="ml-2 text-gray-500 text-sm">(Your Profile)</span>
          )}
        </h1>
        <div className="profile-picture-container mb-4 text-center">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={`${user.username}'s profile`}
              className="profile-picture w-32 h-32 rounded-full object-cover mx-auto border-2 border-green-500"
            />
          ) : (
            <div className="profile-picture-placeholder w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm mx-auto border-2 border-green-500">
              No Image
            </div>
          )}
        </div>
        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        {user.bio && (
          <p className="mb-2">
            <strong>Bio:</strong> {user.bio}
          </p>
        )}
        <p className="mb-2">
          <strong>Account Type:</strong>{" "}
          {user.is_expert ? "Agricultural Expert" : "General User"}
        </p>
        <p>
          <strong>Member Since:</strong>{" "}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
        <p className="mb-2">
          <strong>Followers:</strong> {user.followers_count}
        </p>
        <p className="mb-2">
          <strong>Following Users:</strong> {user.following_users_count}
        </p>
        <p className="mb-2">
          <strong>Following Communities:</strong>{" "}
          {user.following_communities_count}
        </p>

        {!isOwnProfile && currentUserId && (
          <button
            onClick={handleFollowToggle}
            className={`mt-4 py-2 px-4 rounded text-white font-bold ${
              user.is_followed_by_current_user
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {user.is_followed_by_current_user ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <UserListFilter title="Followers" users={followers} />

      <UserListFilter title="Following" users={following} />

      <div className="section-box bg-white p-6 rounded shadow-md mt-4">
        <h3 className="text-xl font-semibold mb-2">{user.username}'s Posts</h3>
        <p>List of {user.username}'s posts will go here.</p>
      </div>
    </div>
  );
}

export default UserDetailPage;
