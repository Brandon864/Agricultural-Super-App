// src/pages/UserProfilePage.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
// Assuming you have these queries in your apiSlice
import {
  useGetUserQuery,
  useUpdateUserMutation,
  useGetUserPostsQuery, // NEW: For fetching user's posts
  useGetUserJoinedCommunitiesQuery, // NEW: For fetching user's joined communities
} from "../redux/api/apiSlice";
import { setCredentials } from "../redux/auth/authSlice";
import "../App.css";

import defaultAvatar from "../assets/images/user-icon.svg";

function UserProfilePage() {
  const dispatch = useDispatch();
  const { currentUser, token } = useSelector((state) => state.auth);

  const {
    data: userData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUserQuery(currentUser?.id, {
    skip: !currentUser?.id,
    selectFromResult: ({ data, ...rest }) => ({
      data: data && typeof data === "object" && data.id ? data : null,
      ...rest,
    }),
  });

  // NEW: Fetch user's posts
  const {
    data: userPosts,
    isLoading: arePostsLoading,
    isSuccess: arePostsSuccess,
    isError: arePostsError,
    error: postsError,
  } = useGetUserPostsQuery(currentUser?.id, {
    skip: !currentUser?.id,
  });

  // NEW: Fetch user's joined communities
  const {
    data: userCommunities,
    isLoading: areCommunitiesLoading,
    isSuccess: areCommunitiesSuccess,
    isError: areCommunitiesError,
    error: communitiesError,
  } = useGetUserJoinedCommunitiesQuery(currentUser?.id, {
    skip: !currentUser?.id,
  });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (isSuccess && userData) {
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setBio(userData.bio || "");
      setProfilePicturePreview(userData.profile_picture_url || defaultAvatar);
    } else if (currentUser && currentUser.id) {
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      setBio(currentUser.bio || "");
      setProfilePicturePreview(
        currentUser.profile_picture_url || defaultAvatar
      );
    }
  }, [isSuccess, userData, currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      setProfilePicturePreview(URL.createObjectURL(file));
    } else {
      setProfilePicturePreview(
        userData?.profile_picture_url ||
          currentUser?.profile_picture_url ||
          defaultAvatar
      );
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("bio", bio);

    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    }

    try {
      const updatedUserResponse = await updateUser(formData).unwrap();

      if (updatedUserResponse.user) {
        dispatch(
          setCredentials({ token: token, user: updatedUserResponse.user })
        );
        setMessage("Profile updated successfully!");
        if (updatedUserResponse.user.profile_picture_url) {
          setProfilePicturePreview(
            updatedUserResponse.user.profile_picture_url
          );
        }
        setSelectedFile(null);
      } else {
        setMessage(
          updatedUserResponse.message ||
            "No changes provided or nothing to update."
        );
      }
    } catch (err) {
      setMessage(
        err.data?.message ||
          err.error?.message ||
          "Failed to update profile. Please try again."
      );
      console.error("Update profile error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <p className="loading-message">Loading profile...</p>
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="page-container">
        <p className="error-message">
          {error?.data?.message ||
            "Error loading profile: An unexpected error occurred."}
        </p>
        {!currentUser?.id && (
          <>
            <p>Please ensure you are logged in.</p>
            <p>
              <Link to="/login" className="nav-link">
                Go to Login
              </Link>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="page-container user-profile-page">
      <div className="profile-card card">
        <h1 className="profile-heading">{userData.username}'s Profile</h1>
        <div className="profile-picture-container">
          <img
            src={profilePicturePreview}
            alt={`${userData.username}'s profile`}
            className="profile-picture"
          />
        </div>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        {userData.bio && (
          <p>
            <strong>Bio:</strong> {userData.bio}
          </p>
        )}
        <p>
          <strong>Account Type:</strong>{" "}
          {userData.is_expert ? "Agricultural Expert" : "General User"}
        </p>
        <p>
          <strong>Member Since:</strong>{" "}
          {new Date(userData.created_at).toLocaleDateString()}
        </p>
        {userData.followers_count !== undefined && (
          <p>
            <strong>Followers:</strong> {userData.followers_count}
          </p>
        )}
        {userData.following_users_count !== undefined && (
          <p>
            <strong>Following Users:</strong> {userData.following_users_count}
          </p>
        )}
        {userData.following_communities_count !== undefined && (
          <p>
            <strong>Following Communities:</strong>{" "}
            {userData.following_communities_count}
          </p>
        )}
      </div>
      <div className="profile-edit-section form-container">
        <h3 className="section-heading">Update Profile Information</h3>
        {message && (
          <div
            className={`message ${
              message.includes("successful") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="edit-username">Username:</label>
            <input
              type="text"
              id="edit-username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">Email:</label>
            <input
              type="email"
              id="edit-email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-bio">Bio:</label>
            <textarea
              id="edit-bio"
              className="textarea-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="edit-profile-picture-upload">
              Profile Picture:
            </label>
            <input
              type="file"
              id="edit-profile-picture-upload"
              className="input-field"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            className="button primary-button"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="profile-sections">
        <div className="section-box card">
          <h3 className="section-heading">My Posts</h3>
          {arePostsLoading && (
            <p className="loading-message">Loading posts...</p>
          )}
          {arePostsError && (
            <p className="message error">
              Error loading posts:{" "}
              {postsError?.data?.message || "Unknown error"}
            </p>
          )}
          {arePostsSuccess && userPosts && userPosts.length > 0 ? (
            <ul className="post-list">
              {userPosts.map((post) => (
                <li key={post.id} className="post-list-item">
                  <Link to={`/posts/${post.id}`} className="post-title-link">
                    {post.title}
                  </Link>
                  {post.content && (
                    <p className="post-excerpt">
                      {post.content.substring(0, 100)}...
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !arePostsLoading &&
            !arePostsError && (
              <p className="no-content-message">No posts yet.</p>
            )
          )}
        </div>

        <div className="section-box card">
          <h3 className="section-heading">Communities I've Joined</h3>
          {areCommunitiesLoading && (
            <p className="loading-message">Loading communities...</p>
          )}
          {areCommunitiesError && (
            <p className="message error">
              Error loading communities:{" "}
              {communitiesError?.data?.message || "Unknown error"}
            </p>
          )}
          {areCommunitiesSuccess &&
          userCommunities &&
          userCommunities.length > 0 ? (
            <ul className="community-list">
              {userCommunities.map((community) => (
                <li key={community.id} className="community-list-item-profile">
                  <Link
                    to={`/communities/${community.id}`}
                    className="community-name-link"
                  >
                    {community.name}
                  </Link>
                  {community.description && (
                    <p className="community-description">
                      {community.description.substring(0, 70)}...
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !areCommunitiesLoading &&
            !areCommunitiesError && (
              <p className="no-content-message">
                Not a member of any communities yet.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
