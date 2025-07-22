import React, { useState } from "react";
import { useSelector } from "react-redux"; // CORRECT: Import useSelector
import { Link } from "react-router-dom"; // Added Link for navigation
import { useUploadImageMutation } from "../redux/api/apiSlice"; // CORRECT: Import useUploadImageMutation from apiSlice

function UploadImagePage() {
  const { currentUser, token } = useSelector((state) => state.auth); // CORRECT: Get currentUser and token from Redux
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [message, setMessage] = useState("");

  const [uploadImage, { isLoading, isError, isSuccess, error }] =
    useUploadImageMutation();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setMessage("");
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentUser) {
      setMessage("You must be logged in to upload an image."); // Changed from alert
      return;
    }

    if (!selectedFile) {
      setMessage("Please select a file to upload."); // Changed from alert
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // 'file' must match the key expected by Flask (request.files['file'])

    try {
      const response = await uploadImage(formData).unwrap();
      setMessage(`Image uploaded successfully! URL: ${response.url}`);
      setSelectedFile(null);
      setFilePreview(null);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setMessage(
        `Failed to upload image: ${
          err?.data?.message || "Unknown error. Please try again."
        }`
      );
    }
  };

  return (
    <div className="page-container upload-image-page">
      <h1>Upload Agricultural Image</h1>
      <p>
        Upload images of healthy/diseased plants or animals, or related
        procedures.
      </p>

      {!currentUser && (
        <p className="login-prompt">
          Please{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            log in
          </Link>{" "}
          to upload images.
        </p>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="image-upload">Select Image:</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={!currentUser || isLoading}
          />
        </div>

        {filePreview && (
          <div className="image-preview">
            <img
              src={filePreview}
              alt="File Preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        <button
          type="submit"
          className="button primary-button"
          disabled={!currentUser || isLoading || !selectedFile}
        >
          {isLoading ? "Uploading..." : "Upload Image"}
        </button>

        {isSuccess && (
          <p className="success-message">Image uploaded successfully!</p>
        )}
        {isError && (
          <p className="error-message">
            Upload failed:{" "}
            {error?.data?.message || "Check console for details."}
          </p>
        )}
        {message &&
          !isSuccess &&
          !isError && ( // Display general messages
            <p className="message">{message}</p>
          )}
      </form>
    </div>
  );
}

export default UploadImagePage;
