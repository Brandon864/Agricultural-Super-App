import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetUserQuery, useUpdateUserMutation } from "../redux/api/apiSlice"; // Import necessary hooks from apiSlice
import { setCredentials } from "../redux/auth/authSlice"; // For updating Redux state after profile update

function UserProfilePage() {
  const dispatch = useDispatch();
  const { currentUser, token } = useSelector((state) => state.auth);

  // useGetUserQuery will automatically refetch when 'User' tag is invalidated by updateUser
  const {
    data: userData,
    isLoading,
    isSuccess,
    isError,
    error,
    // refetch, // We no longer need to explicitly destructure refetch if we're not calling it manually
  } = useGetUserQuery(undefined, {
    skip: !currentUser?.id,
  });

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [message, setMessage] = useState("");

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    // This effect ensures the form fields are populated with current user data
    // It runs when userData is successfully fetched or when currentUser changes
    if (isSuccess && userData) {
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setBio(userData.bio || "");
      setProfilePictureUrl(userData.profile_picture_url || "");
    } else if (currentUser) {
      // Fallback to currentUser if userData not yet available or failed
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
    }
  }, [isSuccess, userData, currentUser]); // Dependencies ensure effect runs when these values change

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    const updatedFields = {
      username,
      email,
      bio,
      profile_picture_url: profilePictureUrl,
    };

    try {
      const updatedUserResponse = await updateUser(updatedFields).unwrap();
      setMessage("Profile updated successfully!");
      // Update the Redux auth state with the new user info from the backend response
      // RTK Query will automatically refetch the profile data in the background due to invalidatesTags
      dispatch(setCredentials({ token: token, user: updatedUserResponse }));
      // Removed: refetch(); // This line is no longer needed as invalidatesTags handles it
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage(
        err.data?.message || // Message from backend if available
          err.error?.message || // Fallback for RTK Query errors
          "Failed to update profile. Please try again." // Generic fallback
      );
    }
  };

  if (isLoading) {
    return (
      <div className="page-container text-center">
        <p className="loading-message">Loading profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container text-center">
        <p className="error">
          Error loading profile:{" "}
          {error?.data?.message || "An unexpected error occurred."}
        </p>
        <p>Please ensure you are logged in.</p>
      </div>
    );
  }

  // Handle case where userData is still null after loading (e.g., not logged in, or initial skip)
  if (!userData && !isLoading) {
    return (
      <div className="page-container text-center">
        <p className="no-content-message">
          No profile data available. You might need to log in.
        </p>
        <p>
          <a href="/login" className="text-blue-500 hover:underline">
            Go to Login
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="user-profile-page container mx-auto p-4">
      <div className="profile-card bg-white p-6 rounded shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-4">
          {userData.username}'s Profile
        </h1>
        <div className="profile-picture-container mb-4 text-center">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${userData.username}'s profile`}
              className="profile-picture w-32 h-32 rounded-full object-cover mx-auto border-2 border-green-500"
            />
          ) : (
            <div className="profile-picture-placeholder w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm mx-auto border-2 border-green-500">
              No Image
            </div>
          )}
        </div>
        <p className="mb-2">
          <strong>Email:</strong> {userData.email}
        </p>
        {/* Only display bio paragraph if bio data exists */}
        {userData.bio && (
          <p className="mb-2">
            <strong>Bio:</strong> {userData.bio}
          </p>
        )}
        <p className="mb-2">
          <strong>Account Type:</strong>{" "}
          {userData.is_expert ? "Agricultural Expert" : "General User"}
        </p>
        <p>
          <strong>Member Since:</strong>{" "}
          {new Date(userData.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="profile-edit-section bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          Update Profile Information
        </h3>
        {message && (
          <div
            className={`p-2 mb-4 rounded ${
              message.includes("successful")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label
              htmlFor="edit-username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username:
            </label>
            <input
              type="text"
              id="edit-username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="edit-email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              id="edit-email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="edit-bio"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Bio:
            </label>
            <textarea
              id="edit-bio"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <div className="mb-6">
            <label
              htmlFor="edit-profile-picture"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Profile Picture URL:
            </label>
            <input
              type="text"
              id="edit-profile-picture"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              placeholder="Enter URL for profile picture"
            />
            {profilePictureUrl && (
              <img
                src={profilePictureUrl}
                alt="Preview"
                className="mt-2 max-w-[100px] max-h-[100px] rounded object-cover"
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="profile-sections mt-8">
        <div className="section-box bg-white p-6 rounded shadow-md mb-4">
          <h3 className="text-xl font-semibold mb-2">My Posts</h3>
          <p>List of user's posts will go here.</p>
        </div>
        <div className="section-box bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-2">My Communities</h3>
          <p>List of communities user has joined will go here.</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
