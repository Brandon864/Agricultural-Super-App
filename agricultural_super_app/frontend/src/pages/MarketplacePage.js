import React from "react";
import { Link } from "react-router-dom";
import { useGetMarketplaceItemsQuery } from "../redux/api/marketplaceApiSlice"; // NEW: Import the hook

function MarketplacePage() {
  // NEW: Use the RTK Query hook to fetch marketplace items
  const {
    data: marketplaceItems,
    isLoading,
    isError,
    error,
  } = useGetMarketplaceItemsQuery();

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading marketplace items...</p>
      </div>
    );
  }

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
      <div className="marketplace-header">
        <h1>Agricultural Marketplace</h1>
        <Link to="/marketplace/create" className="button primary-button">
          + Post New Sale
        </Link>
      </div>

      <p>
        Here, users can buy and sell agricultural products, equipment, or
        services.
      </p>

      <div className="marketplace-grid">
        {marketplaceItems && marketplaceItems.length > 0 ? (
          marketplaceItems.map((item) => (
            <div key={item.id} className="marketplace-item-card card">
              <h2>{item.title}</h2>
              <p className="item-price">
                Ksh {item.price.toFixed(2)} {item.unit_of_measure}
              </p>
              <p className="item-description">{item.description}</p>
              <p className="item-category">Category: {item.category}</p>
              <p className="item-location">Location: {item.location}</p>
              <p className="item-seller">Seller: {item.seller_username}</p>
              <p className="item-quantity">
                Available: {item.quantity_available}
              </p>
              {/* You might add a Link to a detail page for each item later */}
              <Link
                to={`/marketplace/items/${item.id}`}
                className="button secondary-button"
              >
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p>No marketplace items available yet. Be the first to post one!</p>
        )}
      </div>
    </div>
  );
}

export default MarketplacePage;
