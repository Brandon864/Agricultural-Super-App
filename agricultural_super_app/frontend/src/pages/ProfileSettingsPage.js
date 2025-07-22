import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetUserQuery,
  useUpdateUserProfileMutation,
} from "../redux/api/apiSlice"; // Import hooks

function ProfileSettingsPage() {
  const { currentUser } = useSelector((state) => state.auth);

  // Fetch the latest user data
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetUserQuery(undefined, {
    skip: !currentUser, // Skip fetching if no current user is logged in
  });

  const [
    updateProfile,
    {
      isLoading: isUpdatingProfile,
      isSuccess: isUpdateSuccess,
      isError: isUpdateError,
      error: updateError,
    },
  ] = useUpdateUserProfileMutation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(""); // State for bio
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userData) {
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setBio(userData.bio || ""); // Set bio from fetched data
    }
  }, [userData]); // Update form fields when userData changes

  useEffect(() => {
    if (isUpdateSuccess) {
      setMessage("Profile updated successfully!");
      // The useGetUserQuery will automatically refetch because of tag invalidation
      // if it's subscribed on this page or another. If not, you might need
      // to manually dispatch api.util.invalidateTags(['User']) from Redux.
      // For now, RTK Query's invalidatesTags should handle it.
    }
    if (isUpdateError) {
      setMessage(
        `Error updating profile: ${
          updateError?.data?.message || "Please try again."
        }`
      );
      console.error("Update profile error:", updateError);
    }
  }, [isUpdateSuccess, isUpdateError, updateError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    if (!currentUser) {
      setMessage("You must be logged in to update your profile.");
      return;
    }

    try {
      // Send only the fields that are meant to be updated
      await updateProfile({
        id: currentUser.id, // Pass the user ID for invalidation (important!)
        username,
        email,
        bio, // Include bio in the payload
      }).unwrap(); // Use unwrap to catch errors with try/catch
    } catch (err) {
      // Error handling is already done by the useEffect above
      // You can add more specific logging here if needed
    }
  };

  if (isUserLoading) return <div>Loading profile...</div>;
  if (isUserError)
    return (
      <div>
        Error loading profile:{" "}
        {userError?.data?.message || "Could not fetch profile."}
      </div>
    );
  if (!userData) return <div>No profile data found.</div>;

  return (
    <div className="profile-settings-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        {message && (
          <p className={isUpdateError ? "text-red-500" : "text-green-500"}>
            {message}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        <button type="submit" disabled={isUpdatingProfile}>
          {isUpdatingProfile ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettingsPage;
