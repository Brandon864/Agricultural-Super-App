import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // CORRECT: Added for auth state
import { useCreateCommunityMutation } from "../redux/api/apiSlice"; // Assuming this is needed

function CreateCommunityPage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth); // Get current user from Redux

  // Redirect if not logged in (though PrivateRoute should ideally handle this already)
  if (!currentUser) {
    navigate("/login");
    return null; // Or show a loading/redirect message
  }

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const [createCommunity, { isLoading }] = useCreateCommunityMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await createCommunity({ name, description }).unwrap();
      setMessage("Community created successfully!");
      navigate("/communities"); // Redirect to communities list
    } catch (err) {
      console.error("Failed to create community:", err);
      setMessage(
        err.data?.message ||
          err.error?.message ||
          "Failed to create community. Please try again."
      );
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Create New Community</h2>
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
            <label htmlFor="name">Community Name:</label>
            <input
              type="text"
              id="name"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="button primary-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCommunityPage;
