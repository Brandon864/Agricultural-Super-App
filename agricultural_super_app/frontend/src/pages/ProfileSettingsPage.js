// src/pages/ProfileSettingsPage.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Hook to get data from Redux store (for current user)
import {
  useGetUserQuery, // RTK Query hook to fetch user data
  useUpdateUserProfileMutation, // RTK Query hook for updating user profile fields
} from "../redux/api/apiSlice"; // Make sure these are defined in your apiSlice

function ProfileSettingsPage() {
  // Get the current logged-in user from the Redux authentication state.
  const { currentUser } = useSelector((state) => state.auth);

  // RTK Query hook to fetch the latest user data.
  // `skip: !currentUser` means this query won't run until `currentUser` is available.
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetUserQuery(undefined, {
    skip: !currentUser, // Skip if no user is logged in
  });

  // RTK Query mutation hook for updating user profile fields.
  const [
    updateProfile,
    {
      isLoading: isUpdatingProfile, // True while update is in progress
      isSuccess: isUpdateSuccess, // True if update succeeded
      isError: isUpdateError, // True if update failed
      error: updateError, // Contains error details if update failed
    },
  ] = useUpdateUserProfileMutation();

  // State variables for form inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(""); // State for user's biography
  // State to display messages (success/error) to the user
  const [message, setMessage] = useState("");

  // useEffect hook to populate the form fields when `userData` is successfully loaded or changes.
  useEffect(() => {
    if (userData) {
      setUsername(userData.username || ""); // Set username from fetched data
      setEmail(userData.email || ""); // Set email from fetched data
      setBio(userData.bio || ""); // Set bio from fetched data
    }
  }, [userData]); // Dependency array: re-run when `userData` changes

  // useEffect hook to display success or error messages after an update attempt.
  useEffect(() => {
    if (isUpdateSuccess) {
      setMessage("Profile updated successfully!");
      // RTK Query's `invalidatesTags` configured in your `apiSlice` should
      // automatically refetch `useGetUserQuery` wherever it's used,
      // so you usually don't need manual refetching here.
    }
    if (isUpdateError) {
      // Display specific error message from the backend if available, otherwise a generic one.
      setMessage(
        `Error updating profile: ${
          updateError?.data?.message || "Please try again."
        }`
      );
      console.error("Update profile error:", updateError); // Log error for debugging
    }
  }, [isUpdateSuccess, isUpdateError, updateError]); // Dependencies: runs when these states change

  // Handler for form submission to update the profile.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(""); // Clear any previous messages

    // Basic check: ensure user is logged in before attempting to update.
    if (!currentUser) {
      setMessage("You must be logged in to update your profile.");
      return;
    }

    try {
      // Call the `updateProfile` mutation with the updated fields.
      // Make sure `currentUser.id` is included if your backend expects it for the update.
      // `.unwrap()` helps to catch errors with the `try/catch` block.
      await updateProfile({
        id: currentUser.id, // Pass user ID (important for identifying which profile to update)
        username,
        email,
        bio, // Include the bio field in the payload
      }).unwrap();
    } catch (err) {
      // Error handling is largely done by the `useEffect` above,
      // but you can add more specific logging here if needed.
    }
  };

  // --- Conditional Rendering based on data fetch status ---
  if (isUserLoading) return <div>Loading profile...</div>; // Show loading message
  if (isUserError)
    return (
      <div>
        Error loading profile:{" "}
        {userError?.data?.message || "Could not fetch profile."}{" "}
        {/* Display error message */}
      </div>
    );
  if (!userData) return <div>No profile data found.</div>; // Message if no user data is returned

  return (
    <div className="profile-settings-container">
      {" "}
      {/* Main container for profile settings page */}
      <h2>Edit Profile</h2>
      {/* Display success or error messages */}
      {message && (
        <p className={isUpdateError ? "text-red-500" : "text-green-500"}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {" "}
          {/* Group for username input */}
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state
            required
            className="input-field" // Apply general styling
          />
        </div>
        <div className="form-group">
          {" "}
          {/* Group for email input */}
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            required
            className="input-field" // Apply general styling
          />
        </div>
        <div className="form-group">
          {" "}
          {/* Group for bio textarea */}
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)} // Update bio state
            rows="4"
            placeholder="Tell us about yourself..."
            className="input-field textarea-field" // Apply general styling
          ></textarea>
        </div>

        <button
          type="submit"
          className="button primary-button" // Apply primary button styling
          disabled={isUpdatingProfile} // Disable button while profile is updating
        >
          {isUpdatingProfile ? "Updating..." : "Save Changes"}{" "}
          {/* Button text changes */}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettingsPage;
