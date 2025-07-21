import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Needed for current user info/token
import { useUploadImageMutation } from "../redux/api/uploadApiSlice"; // We'll create this slice next!

function UploadImagePage() {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // To show image preview
  const [uploadImage, { isLoading, isError, isSuccess, error }] =
    useUploadImageMutation();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file)); // Create a URL for image preview
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to upload an image.");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    // FormData is required for sending files
    const formData = new FormData();
    formData.append("file", selectedFile); // 'file' must match the key expected by Flask (request.files['file'])

    try {
      const response = await uploadImage(formData).unwrap();
      alert(`Image uploaded successfully! URL: ${response.url}`);
      setSelectedFile(null); // Clear selected file
      setFilePreview(null); // Clear preview
      // You might want to navigate away or show a success message on the page
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert(
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
        <p className="login-prompt">Please log in to upload images.</p>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="image-upload">Select Image:</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*" // Accept any image file types
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
      </form>
    </div>
  );
}

export default UploadImagePage;
