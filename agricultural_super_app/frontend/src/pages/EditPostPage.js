import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetSinglePostQuery,
  useUpdatePostMutation,
} from "../redux/api/apiSlice";
import "../App.css"; // Assuming your general styles are here

function EditPostPage() {
  const { postId } = useParams(); // Get post ID from URL
  const navigate = useNavigate();

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = useGetSinglePostQuery(postId);
  const [
    updatePost,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdatePostMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Populate form fields when post data is loaded
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.image_url || ""); // Handle cases where image_url might be null
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePost({
        postId,
        title,
        content,
        image_url: imageUrl,
      }).unwrap();
      navigate(`/posts/${postId}`); // Redirect back to the single post page after update
    } catch (err) {
      console.error("Failed to update post:", err);
      // You can set a local error state to display a message to the user
    }
  };

  if (isPostLoading) {
    return <div className="page-container">Loading post for editing...</div>;
  }

  if (isPostError) {
    return (
      <div className="page-container error-message">
        Error loading post:{" "}
        {postError?.data?.message || "Post not found or access denied."}
      </div>
    );
  }

  if (!post) {
    return <div className="page-container error-message">Post not found.</div>;
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Edit Post: {post.title}</h2>
        <form onSubmit={handleSubmit}>
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
              rows="6"
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (Optional):</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          {isUpdateError && (
            <p className="error-message">
              Error updating post:{" "}
              {updateError?.data?.message || "Something went wrong."}
            </p>
          )}
          <button
            type="submit"
            className="button primary-button"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Post"}
          </button>
          <button
            type="button"
            className="button secondary-button"
            onClick={() => navigate(-1)}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;
