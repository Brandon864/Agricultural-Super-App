import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCreateCommunityMutation } from "../redux/api/communitiesApiSlice"; // Corrected import

function CreateCommunityPage() {
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [createCommunity, { isLoading }] = useCreateCommunityMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentUser) {
      setMessage("You must be logged in to create a community.");
      return;
    }

    if (!communityName.trim()) {
      setMessage("Community Name cannot be empty.");
      return;
    }

    try {
      const newCommunity = await createCommunity({
        name: communityName,
        description: description,
        creator_id: currentUser.id,
      }).unwrap();

      setMessage("Community created successfully!");
      navigate(`/communities/${newCommunity.id}`);
    } catch (err) {
      console.error("Failed to create community:", err);
      setMessage(
        err.data?.message || "Error creating community: Something went wrong."
      );
    }
  };

  return (
    <div className="page-container create-community-page">
      <div className="form-container">
        <h2>Create New Community</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="communityName">Community Name:</label>
            <input
              type="text"
              id="communityName"
              className="input-field"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (Optional):</label>
            <textarea
              id="description"
              className="textarea-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              disabled={isLoading}
            ></textarea>
          </div>
          <button
            type="submit"
            className="button primary-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Community"}
          </button>
          {message && (
            <p
              className={`message ${
                message.includes("successfully") ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateCommunityPage;
