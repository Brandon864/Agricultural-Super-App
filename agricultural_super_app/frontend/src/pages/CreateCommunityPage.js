// src/pages/CreateCommunityPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Hook for navigation
import { useSelector } from "react-redux"; // Hook to get data from Redux store (for current user)
import { useCreateCommunityMutation } from "../redux/api/apiSlice"; // RTK Query hook for creating a community

function CreateCommunityPage() {
  // Hook to navigate to different routes
  const navigate = useNavigate();
  // Get the current logged-in user from the Redux authentication state.
  // This helps confirm if a user is authorized to create a community.
  const { currentUser } = useSelector((state) => state.auth);

  // --- Important: Place all React hooks (like useState, useSelector, custom hooks)
  // --- at the top level of your component, unconditionally.
  // State variables for the community form inputs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // State for displaying success or error messages to the user
  const [message, setMessage] = useState("");

  // RTK Query hook for creating a community. `isLoading` is true while the request is pending.
  const [createCommunity, { isLoading }] = useCreateCommunityMutation();
  // --- End of hook declarations ---

  // Redirect if the user is not logged in.
  // This check should happen after all hooks are called.
  // While `ProtectedRoute` typically handles this, adding it here provides an extra safety net.
  if (!currentUser) {
    navigate("/login");
    return null; // Don't render the form if redirecting
  }

  // Handle form submission for creating a new community.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default browser form submission behavior.
    setMessage(""); // Clear any previous messages.

    try {
      // Call the `createCommunity` mutation with the form data.
      // `.unwrap()` is used to get the actual result or throw an error for `catch` block.
      await createCommunity({ name, description }).unwrap();
      setMessage("Community created successfully!"); // Set success message
      // Navigate to the communities list page after a successful creation.
      navigate("/communities");
    } catch (err) {
      // Log the error for debugging purposes.
      console.error("Failed to create community:", err);
      // Set an error message to display to the user, using backend message if available.
      setMessage(
        err.data?.message || // Backend error message
          err.error?.message || // RTK Query error message
          "Failed to create community. Please try again." // Generic fallback
      );
    }
  };

  return (
    <div className="page-container">
      {" "}
      {/* Main container for the page */}
      <div className="form-container">
        {" "}
        {/* Container specifically for the form */}
        <h2>Create New Community</h2>
        {/* Display success or error messages */}
        {message && (
          <p
            className={`message ${
              message.includes("successful") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            {" "}
            {/* Group for a form input (label + input) */}
            <label htmlFor="name">Community Name:</label>
            <input
              type="text"
              id="name"
              className="input-field" // Apply general input field styling
              value={name}
              onChange={(e) => setName(e.target.value)} // Update state on input change
              required // Make this field mandatory
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              className="input-field" // Apply general input field styling
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5" // Set initial height for the textarea
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="button primary-button" // Apply primary button styling
            disabled={isLoading} // Disable button while the community is being created
          >
            {isLoading ? "Creating..." : "Create Community"}{" "}
            {/* Button text changes based on loading state */}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCommunityPage;
