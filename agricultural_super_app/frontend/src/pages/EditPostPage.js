// agricultural_super_app/frontend/src/pages/EditPostPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Hooks for URL parameters and navigation
import {
  useGetSinglePostQuery, // RTK Query hook to fetch a single post's details
  useUpdatePostMutation, // RTK Query hook for updating an existing post
} from "../redux/api/apiSlice"; // Make sure these are defined in your apiSlice
import "../App.css"; // Import general styles

function EditPostPage() {
  // Get the 'postId' parameter from the URL (e.g., /posts/:postId/edit)
  const { postId } = useParams();
  // Hook to navigate to different routes
  const navigate = useNavigate();

  // RTK Query hook to fetch the details of the post to be edited.
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = useGetSinglePostQuery(postId);

  // RTK Query mutation hook for updating the post.
  const [
    updatePost,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdatePostMutation();

  // State variables for the form inputs, initialized as empty strings.
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // useEffect hook to populate the form fields once the post data is loaded.
  useEffect(() => {
    // Check if 'post' data is available (it will be `undefined` initially, then the fetched data).
    if (post) {
      setTitle(post.title); // Set title from fetched post data
      setContent(post.content); // Set content from fetched post data
      setImageUrl(post.image_url || ""); // Set image URL (use empty string if it's null/undefined)
    }
  }, [post]); // Dependency array: this effect runs whenever the 'post' object changes.

  // Handler for form submission to update the post.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission.
    try {
      // Call the `updatePost` mutation with the post ID and updated data.
      // `.unwrap()` helps in error handling by throwing the error if the mutation fails.
      await updatePost({
        postId, // The ID of the post to update
        title, // New title from form state
        content, // New content from form state
        image_url: imageUrl, // New image URL from form state
      }).unwrap();
      navigate(`/posts/${postId}`); // Redirect back to the single post's detail page after successful update.
    } catch (err) {
      console.error("Failed to update post:", err);
      // Here, you would typically set a local error state (e.g., `setFormError(err.data.message)`)
      // to display a message to the user on the form itself.
    }
  };

  // Show a loading message while the post data is being fetched for editing.
  if (isPostLoading) {
    return <div className="page-container">Loading post for editing...</div>;
  }

  // Show an error message if there was a problem loading the post.
  if (isPostError) {
    return (
      <div className="page-container error-message">
        Error loading post:{" "}
        {postError?.data?.message || "Post not found or access denied."}{" "}
        {/* Display specific error or generic message */}
      </div>
    );
  }

  // If `post` is null or undefined after loading (e.g., post not found), display a message.
  if (!post) {
    return <div className="page-container error-message">Post not found.</div>;
  }

  return (
    <div className="page-container">
      {" "}
      {/* Main container for the page */}
      <div className="form-container">
        {" "}
        {/* Container specifically for the form */}
        <h2>Edit Post: {post.title}</h2>{" "}
        {/* Display the original post title being edited */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            {" "}
            {/* Group for the post title input */}
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Update title state on change
              required // Make this field mandatory
              className="input-field" // Apply general input field styling
            />
          </div>
          <div className="form-group">
            {" "}
            {/* Group for the post content textarea */}
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)} // Update content state on change
              rows="6" // Set initial height for the textarea
              required // Make this field mandatory
              className="input-field textarea-field" // Apply general textarea styling
            ></textarea>
          </div>
          <div className="form-group">
            {" "}
            {/* Group for the image URL input */}
            <label htmlFor="imageUrl">Image URL (Optional):</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)} // Update image URL state on change
              className="input-field" // Apply general input field styling
            />
          </div>
          {/* Display error message if the update mutation failed */}
          {isUpdateError && (
            <p className="error-message">
              Error updating post:{" "}
              {updateError?.data?.message || "Something went wrong."}
            </p>
          )}
          <button
            type="submit"
            className="button primary-button" // Apply primary button styling
            disabled={isUpdating} // Disable button while the post is being updated
          >
            {isUpdating ? "Updating..." : "Update Post"}{" "}
            {/* Button text changes based on loading state */}
          </button>
          <button
            type="button" // Use type "button" to prevent form submission
            className="button secondary-button" // Apply secondary button styling
            onClick={() => navigate(-1)} // Navigate back to the previous page in history
            style={{ marginLeft: "10px" }} // Simple inline style for spacing
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;
