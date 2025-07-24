// src/pages/MarketplacePage.js
import React from "react";
import { Link } from "react-router-dom"; // For navigation links
import { useGetMarketplaceItemsQuery } from "../redux/api/apiSlice"; // RTK Query hook to fetch all marketplace items

function MarketplacePage() {
  // Use the RTK Query hook to fetch all marketplace items.
  // `data: marketplaceItems` renames the fetched data, `isLoading` is true while fetching,
  // `isError` if an error occurred, and `error` holds the error details.
  const {
    data: marketplaceItems,
    isLoading,
    isError,
    error,
  } = useGetMarketplaceItemsQuery();

  // Show a loading message while marketplace items are being fetched.
  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading marketplace items...</p>
      </div>
    );
  }

  // Show an error message if there was a problem fetching marketplace items.
  if (isError) {
    return (
      <div className="page-container">
        <p className="error">
          Error loading marketplace items:{" "}
          {error?.data?.message || error?.error}
        </p>
      </div>
    );
  }

  return (
    <div className="page-container marketplace-page">
      {" "}
      {/* Main container for the marketplace page */}
      <div className="marketplace-header">
        <h1>Agricultural Marketplace</h1>
        {/* Link to the page for creating a new marketplace listing */}
        <Link to="/marketplace/create" className="button primary-button">
          + Post New Sale
        </Link>
      </div>
      <p>
        Here, users can buy and sell agricultural products, equipment, or
        services.
      </p>
      <div className="marketplace-grid">
        {" "}
        {/* Grid layout for marketplace item cards */}
        {marketplaceItems && marketplaceItems.length > 0 ? (
          // If items exist, map through them and display each as a card
          marketplaceItems.map((item) => (
            <div key={item.id} className="marketplace-item-card card">
              {" "}
              {/* Card for each item */}
              <h2>{item.title}</h2> {/* Item title */}
              {/* Display price, ensuring it's not null/undefined before formatting */}
              <p className="item-price">
                Ksh {item.price != null ? item.price.toFixed(2) : "N/A"}{" "}
                {/* Format price to 2 decimal places */}
                {item.unit_of_measure} {/* Unit of measure (e.g., per Kg) */}
              </p>
              <p className="item-description">{item.description}</p>
              <p className="item-category">Category: {item.category}</p>
              <p className="item-location">Location: {item.location}</p>
              <p className="item-seller">Seller: {item.seller_username}</p>{" "}
              {/* Seller's username */}
              <p className="item-quantity">
                Available: {item.quantity_available}
              </p>
              {/* Link to the detailed view of the individual item */}
              <Link
                to={`/marketplace/items/${item.id}`}
                className="button secondary-button"
              >
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p>No marketplace items available yet. Be the first to post one!</p> // Message if no items
        )}
      </div>
    </div>
  );
}

export default MarketplacePage;
