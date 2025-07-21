import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePostMutation } from "../../redux/api/apiSlice";
import "../../App.css";

function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [createPost, { isLoading, isError, error, isSuccess }] =
    useCreatePostMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({ title, content, image_url: imageUrl }).unwrap();
      setTitle("");
      setContent("");
      setImageUrl("");
      navigate("/");
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="auth-form">
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional):</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g., https://placehold.co/600x400?text=My+Image"
            className="input-field"
          />
        </div>
        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Post"}
        </button>
        {isSuccess && (
          <p className="success-message">Post created successfully!</p>
        )}
        {isError && (
          <p className="error-message">
            Error: {error?.data?.message || "Failed to create post"}
          </p>
        )}
      </form>
    </div>
  );
}

export default PostForm;
