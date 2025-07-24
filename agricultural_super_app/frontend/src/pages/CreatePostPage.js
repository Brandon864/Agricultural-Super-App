// agricultural_super_app/frontend/src/pages/CreatePostPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePostMutation } from "../redux/api/postsApiSlice"; // RTK Query hook for creating posts
import { useGetCommunitiesQuery } from "../redux/api/communitiesApiSlice";

function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");
  // New state to hold the selected image file
  const [image, setImage] = useState(null);

  const [createPost, { isLoading, isError, error }] = useCreatePostMutation();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useGetCommunitiesQuery();

  // Handle file input change
  const handleImageChange = (e) => {
    // Set the selected file to the 'image' state
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null); // Clear image if nothing is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a new FormData object
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    // Only append community_id if it's selected (not an empty string)
    if (communityId) {
      formData.append("community_id", communityId);
    }
    // Only append the image if one is selected
    if (image) {
      formData.append("image", image); // 'image' should match the field name expected by your backend
    }

    try {
      // Pass the FormData object directly to the mutation
      await createPost(formData).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create post:", err);
      // Display a more user-friendly error message
    }
  };

  if (communitiesLoading)
    return (
      <div className="page-container">
        <p>Loading communities...</p>
      </div>
    );
  if (communitiesError)
    return (
      <div className="page-container">
        <p className="error">Error loading communities.</p>
      </div>
    );

  return (
    <div className="page-container create-post-page">
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="input-field textarea-field"
          ></textarea>
        </div>
        {/* New form group for image upload */}
        <div className="form-group">
          <label htmlFor="image">Upload Image (Optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*" // Restrict to image files
            onChange={handleImageChange}
            className="input-field file-input" // Add a class for potential specific file input styling
          />
          {image && <p>Selected file: {image.name}</p>}{" "}
          {/* Show selected file name */}
        </div>

        <div className="form-group">
          <label htmlFor="community">Community:</label>
          <select
            id="community"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="input-field select-field"
          >
            <option value="">Select a community (Optional)</option>
            {communities &&
              communities.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.name}
                </option>
              ))}
          </select>
        </div>
        <button
          type="submit"
          className="button primary-button"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Post"}
        </button>
        {isError && (
          <p className="error">
            Error: {error?.data?.message || "Failed to create post."}
          </p>
        )}
      </form>
    </div>
  );
}

export default CreatePostPage;
