// agricultural_super_app/frontend/src/pages/CreatePostPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePostMutation } from "../redux/api/postsApiSlice"; // You'll need to define this mutation
import { useGetCommunitiesQuery } from "../redux/api/communitiesApiSlice"; // To get communities for dropdown

function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");

  const [createPost, { isLoading, isError, error }] = useCreatePostMutation();
  const {
    data: communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useGetCommunitiesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This will trigger the Redux Toolkit Query mutation
      await createPost({ title, content, community_id: communityId }).unwrap();
      navigate("/dashboard"); // Navigate to dashboard or new post detail page on success
    } catch (err) {
      console.error("Failed to create post:", err);
      // Handle error, e.g., display an error message to the user
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="community">Community:</label>
          <select
            id="community"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            required
          >
            <option value="">Select a community</option>
            {communities &&
              communities.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.name}
                </option>
              ))}
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
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
