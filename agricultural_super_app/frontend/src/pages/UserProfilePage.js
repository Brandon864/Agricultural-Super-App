import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUpdateUserProfilePictureMutation } from "../redux/api/userApiSlice"; // Corrected import from userApiSlice

function UserProfilePage() {
  const { currentUser, isLoading, error, refetchUser } = useAuth();
  const [newProfilePictureUrl, setNewProfilePictureUrl] = useState("");
  const [message, setMessage] = useState("");

  const [
    updateUserPic,
    {
      isLoading: isUpdating,
      isError: updateError,
      isSuccess: updateSuccess,
      error: updateErrorData,
    },
  ] = useUpdateUserProfilePictureMutation();

  useEffect(() => {
    if (currentUser && currentUser.profile_picture_url) {
      setNewProfilePictureUrl(currentUser.profile_picture_url);
    } else if (currentUser) {
      setNewProfilePictureUrl("");
    }
  }, [currentUser]);

  useEffect(() => {
    if (updateSuccess) {
      setMessage("Profile picture updated successfully!");
      refetchUser();
    }
    if (updateError) {
      setMessage(
        `Failed to update profile picture: ${
          updateErrorData?.data?.message || "Unknown error"
        }`
      );
    }
  }, [updateSuccess, updateError, updateErrorData, refetchUser]);

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p className="error">Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page-container">
        <p>You need to be logged in to view your profile.</p>
        <p>
          <a href="/login">Go to Login</a>
        </p>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    setMessage("");
    try {
      await updateUserPic({ profilePictureUrl: newProfilePictureUrl }).unwrap();
    } catch (err) {
      console.error("Failed to update profile picture:", err);
    }
  };

  return (
    <div className="page-container user-profile-page">
      <div className="profile-card">
        <h2>User Profile</h2>
        {currentUser.profile_picture_url ? (
          <div className="profile-picture-container">
            <img
              src={currentUser.profile_picture_url}
              alt="Profile"
              className="profile-picture"
            />
          </div>
        ) : (
          <div className="profile-picture-placeholder">No Profile Picture</div>
        )}
        <p>
          <strong>Username:</strong> {currentUser.username}
        </p>
        <p>
          <strong>Email:</strong> {currentUser.email}
        </p>
        <p>
          <strong>User ID:</strong> {currentUser.id}
        </p>

        <div className="profile-edit-section">
          <h3>Edit Profile Picture</h3>
          <input
            type="text"
            placeholder="Enter new profile picture URL"
            value={newProfilePictureUrl}
            onChange={(e) => setNewProfilePictureUrl(e.target.value)}
            className="input-field"
            disabled={isUpdating}
          />
          <button
            onClick={handleUpdateProfile}
            className="button primary-button"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Profile Picture"}
          </button>
          {message && (
            <p className={`message ${updateSuccess ? "success" : "error"}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="profile-sections">
        <div className="section-box">
          <h3>My Posts</h3>
          <p>List of user's posts will go here. (Feature to be implemented)</p>
        </div>
        <div className="section-box">
          <h3>My Communities</h3>
          <p>
            List of communities user has joined will go here. (Feature to be
            implemented)
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
