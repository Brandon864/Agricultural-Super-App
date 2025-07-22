import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Correct: Import useSelector
import { useCreateMarketplaceItemMutation } from "../redux/api/apiSlice"; // Correct: Import from your main apiSlice

function CreateMarketplaceItemPage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth); // Get current user from Redux state

  // --- CORRECTED: All hooks must be called unconditionally at the top level ---
  // State for form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Use the mutation hook from apiSlice
  const [createMarketplaceItem, { isLoading, isError, error }] =
    useCreateMarketplaceItemMutation();
  // --- END CORRECTED ---

  // Now, handle the redirect if not logged in. This check comes AFTER all hooks.
  if (!currentUser) {
    navigate("/login");
    return null; // Prevent component from rendering further if not authenticated
  }

  // Define categories for the dropdown
  const categories = [
    "Produce",
    "Livestock",
    "Equipment",
    "Seeds",
    "Fertilizers & Pesticides",
    "Services",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !category ||
      !price ||
      !unitOfMeasure ||
      !quantityAvailable ||
      !location
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      alert("Price must be a positive number.");
      return;
    }
    if (isNaN(quantityAvailable) || parseInt(quantityAvailable) <= 0) {
      alert("Quantity must be a positive integer.");
      return;
    }

    try {
      const itemData = {
        title,
        description,
        category,
        price: parseFloat(price),
        unit_of_measure: unitOfMeasure,
        quantity_available: parseInt(quantityAvailable),
        location,
        image_url: imageUrl,
      };

      await createMarketplaceItem(itemData).unwrap();

      alert("Product listed successfully!");
      navigate("/marketplace");
    } catch (err) {
      console.error("Failed to create marketplace item:", err);
      alert(
        `Failed to list product: ${err?.data?.message || "Please try again."}`
      );
    }
  };

  return (
    <div className="page-container create-marketplace-item-page">
      <h1>Post a New Sale Listing</h1>
      <p>Fill out the form below to list your agricultural product for sale.</p>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="title">Product Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Organic Tomatoes, Used Tractor"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="5"
            placeholder="Provide a detailed description of your product..."
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (Ksh):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0.01"
            step="0.01"
            placeholder="e.g., 250.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="unitOfMeasure">Unit of Measure:</label>
          <input
            type="text"
            id="unitOfMeasure"
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
            required
            placeholder="e.g., per Kg, per Dozen, per Unit"
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantityAvailable">Quantity Available:</label>
          <input
            type="number"
            id="quantityAvailable"
            value={quantityAvailable}
            onChange={(e) => setQuantityAvailable(e.target.value)}
            required
            min="1"
            step="1"
            placeholder="e.g., 100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g., Nairobi, Nakuru, Kisumu"
          />
        </div>

        {/* Image URL field */}
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional):</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste direct image link, e.g., https://example.com/image.jpg"
          />
          {imageUrl && (
            <div className="image-preview">
              <img
                src={imageUrl}
                alt="Product preview"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  marginTop: "10px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="button primary-button"
          disabled={isLoading}
        >
          {isLoading ? "Posting..." : "Post Listing"}
        </button>

        {isError && (
          <p className="error-message">
            Error: {error?.data?.message || "Could not post listing."}
          </p>
        )}
      </form>
    </div>
  );
}

export default CreateMarketplaceItemPage;
