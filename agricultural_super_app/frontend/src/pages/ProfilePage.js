// src/pages/UserProfilePage.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Hook to get data from Redux store (for current user)
import { useGetUserQuery, useUpdateUserMutation } from "../redux/api/apiSlice"; // RTK Query hooks for fetching and updating user data
import { useNavigate } from "react-router-dom"; // Hook for navigation

function UserProfilePage() {
  // Hook to programmatically navigate to different routes
  const navigate = useNavigate();
  // Get the current logged-in user from the Redux authentication state.
  // This provides basic user info like ID, which is needed for the query.
  const { currentUser } = useSelector((state) => state.auth);

  // RTK Query hook to fetch the current user's full profile data.
  // `skip: !currentUser?.id` is crucial: it prevents the query from running
  // until `currentUser.id` is available (meaning a user is logged in).
  const {
    data: userData,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch, // `refetch` function is used to manually re-run the query after an update
  } = useGetUserQuery(undefined, {
    // `undefined` means no argument is passed to the getUser endpoint
    skip: !currentUser?.id, // Skip the query if currentUser or its ID is not present
    refetchOnMountOrArgChange: true, // Ensures data is fresh when component mounts or if currentUser.id changes
    refetchOnReconnect: true, // Refetch if the network connection is re-established
  });

  // RTK Query mutation hook for updating the user's profile.
  const [updateUser] = useUpdateUserMutation();

  // State variables for form inputs, initialized as empty strings
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  // State for the selected profile image file (for upload)
  const [profileImageFile, setProfileImageFile] = useState(null);
  // State for the URL of the current profile image (for display/preview)
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState("");

  // useEffect hook to populate the form fields when user data is successfully loaded or changes.
  useEffect(() => {
    if (isSuccess && userData) {
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setBio(userData.bio || "");
      // Set the current profile image URL from the fetched user data.
      // Assumes the backend provides `profile_picture_url`.
      setCurrentProfileImageUrl(userData.profile_picture_url || "");
    }
  }, [userData, isSuccess]); // Dependencies: runs when `userData` or `isSuccess` changes

  // useEffect hook to redirect to the login page if no authenticated user is found.
  useEffect(() => {
    // If not currently loading, not successfully fetched, AND `currentUser` (or its ID) is missing,
    // then it means the user is not logged in or their session expired.
    if (!isLoading && !isSuccess && !currentUser?.id) {
      console.log(
        "UserProfilePage: No authenticated user found, redirecting to login."
      );
      navigate("/login"); // Redirect to login page
    }
  }, [currentUser, isLoading, isSuccess, navigate]); // Dependencies: runs when these states change

  // Handler for when a new profile picture file is selected.
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfileImageFile(e.target.files[0]); // Store the selected file
      // Create a temporary URL for the selected file to display an immediate preview.
      setCurrentProfileImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handler for form submission to update the user's profile.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Create a FormData object to handle both text fields and file uploads.
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("bio", bio);
    // If a new file was selected, append it to the FormData object.
    // 'profile_picture' should match the field name your backend expects for the file.
    if (profileImageFile) {
      formData.append("profile_picture", profileImageFile);
    }

    try {
      // Call the `updateUser` mutation, passing the FormData directly.
      // RTK Query handles sending FormData correctly for mutations that accept it.
      await updateUser(formData).unwrap();
      alert("Profile updated successfully!");
      refetch(); // Manually refetch user data to ensure the UI shows the latest changes
      setProfileImageFile(null); // Clear the file input state after successful upload
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert(
        "Failed to update profile. " +
          (err.data?.message || err.error || "Unknown error")
      );
    }
  };

  // --- Conditional Rendering based on data fetch status ---
  if (isLoading) {
    return <div className="page-container">Loading profile data...</div>;
  }

  if (isError) {
    console.error("Error fetching profile:", error);
    // If the error is 401 (Unauthorized), it often means the token is invalid or missing.
    if (error.status === 401) {
      return (
        <div className="page-container">
          Access Denied. Please log in again.{" "}
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      );
    }
    // Generic error message for other types of errors.
    return (
      <div className="page-container">
        Error loading profile: {error.error || "Please try again."}
      </div>
    );
  }

  // If `currentUser.id` is missing at this point (and not loading/erroring),
  // it implies the `useEffect` is already handling redirection.
  // We return `null` to prevent rendering content before the redirect.
  if (!currentUser?.id) {
    return null; // The useEffect will handle redirection
  }

  // Render the profile form only if `userData` is available (meaning successful fetch)
  return (
    <div className="page-container">
      {" "}
      {/* Main container for the page */}
      <div className="form-container">
        {" "}
        {/* Container specifically for the form */}
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="profile-image-section">
            {" "}
            {/* Section for profile image display and upload */}
            {currentProfileImageUrl ? (
              <img
                src={currentProfileImageUrl}
                alt="Profile"
                className="profile-image-preview"
                // Fallback image if the provided URL fails to load
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop if fallback also fails
                  e.target.src =
                    "https://via.placeholder.com/150?text=Image+Error";
                }}
              />
            ) : (
              <div className="profile-image-placeholder">No Image Selected</div> // Placeholder if no image
            )}
            <input
              type="file"
              onChange={handleFileChange} // Handle file selection
              accept="image/*" // Only allow image files
            />
          </div>

          <div className="form-group">
            {" "}
            {/* Group for username input */}
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update username state
              required
            />
          </div>
          <div className="form-group">
            {" "}
            {/* Group for email input */}
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
              required
            />
          </div>
          <div className="form-group">
            {" "}
            {/* Group for bio textarea */}
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              className="input-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)} // Update bio state
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="button primary-button">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfilePage;
