// src/components/posts/PostForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePostMutation } from "../../redux/api/apiSlice";
import "../../App.css"; // Ensure App.css is imported for styling

function PostForm() {
  // State variables for form inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // Change this state to hold the File object for upload
  const [selectedFile, setSelectedFile] = useState(null);

  // RTK Query hook for creating a post, destructuring various states
  const [createPost, { isLoading, isError, error, isSuccess }] =
    useCreatePostMutation();
  // Hook to programmatically navigate
  const navigate = useNavigate();

  // Handle file selection from the input
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Get the first selected file
    console.log(
      "File selected in handler:",
      e.target.files[0] ? e.target.files[0].name : "No file"
    ); // ADDED console.log
  };

  // Handle form submission for creating a new post
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("handleSubmit triggered!"); // ADDED console.log

    // Create a FormData object to send both text fields and the file
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // CRUCIAL: Append the image file with the key 'image'
    // This 'image' key must match the 'image' in request.files in your Flask backend
    if (selectedFile) {
      formData.append("image", selectedFile);
      console.log("File appended to FormData:", selectedFile.name); // ADDED console.log
    } else {
      console.log("No file selected for appending to FormData."); // ADDED console.log
    }

    try {
      console.log("Calling createPost mutation with FormData..."); // ADDED console.log
      // Call the createPost mutation with the FormData object
      await createPost(formData).unwrap(); // .unwrap() for error handling
      console.log("createPost mutation successful!"); // ADDED console.log
      // Clear form fields on successful submission
      setTitle("");
      setContent("");
      setSelectedFile(null); // Clear the selected file
      // Redirect to the home page or posts list after successful creation
      navigate("/");
    } catch (err) {
      // Log and display any errors during post creation
      console.error("Failed to create post (caught error):", err); // Modified console.error message
      // RTK Query's `error` state will capture the error for display
    }
  };

  return (
    <div className="form-container">
      {" "}
      {/* Container for the form */}
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {" "}
        {/* Apply auth-form styles */}
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field" // Apply input field styles
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="input-field textarea-field" // Apply textarea styles
          />
        </div>
        <div className="form-group">
          <label htmlFor="postImage">Upload Image (Optional):</label>
          <input
            type="file"
            id="postImage" // Give a new ID
            onChange={handleFileChange} // Use the new handler
            className="input-field" // Apply input field styles
            accept="image/*" // Suggest image file types
          />
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        </div>
        <button
          type="submit"
          className="primary-button" // Apply primary button styles
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? "Creating..." : "Create Post"}{" "}
          {/* Button text changes based on loading state */}
        </button>
        {isSuccess && (
          <p className="success-message">Post created successfully!</p>
        )}
        {isError && (
          <p className="error-message">
            Error: {error?.data?.message || "Failed to create post"}{" "}
            {/* Display error message */}
          </p>
        )}
      </form>
    </div>
  );
}

export default PostForm;
