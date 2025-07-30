import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetMarketplaceItemDetailQuery } from "../redux/api/apiSlice";

function MarketplaceItemDetailPage() {
  const { id } = useParams();

  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useGetMarketplaceItemDetailQuery(id);

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading item details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <p className="error">
          Error loading item: {error?.data?.message || error?.error}
        </p>
        <Link to="/marketplace" className="button secondary-button">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-container">
        <p>Item not found.</p>
        <Link to="/marketplace" className="button secondary-button">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container marketplace-item-detail-page">
      <div className="card item-detail-card">
        {item.image_url && (
          <div className="item-detail-image">
            <img src={item.image_url} alt={item.name} />
          </div>
        )}
        <h1>{item.name}</h1>

        <p className="item-detail-price">
          <strong>Price:</strong> Ksh{" "}
          {item.price != null ? item.price.toFixed(2) : "N/A"}{" "}
          {item.unit_of_measure}
        </p>
        {item.description && (
          <div
            className="item-detail-description single-post-content"
            dangerouslySetInnerHTML={{ __html: item.description }}
          ></div>
        )}
        <p className="item-detail-category">
          <strong>Category:</strong> {item.category}
        </p>
        <p className="item-detail-quantity">
          <strong>Quantity Available:</strong> {item.quantity_available}
        </p>
        <p className="item-detail-location">
          <strong>Location:</strong> {item.location}
        </p>
        <p className="item-detail-seller">
          <strong>Seller:</strong> {item.seller_username}
        </p>
        <p className="item-detail-date">
          Posted on: {new Date(item.created_at).toLocaleDateString()}
        </p>
        <Link to="/marketplace" className="button secondary-button">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

export default MarketplaceItemDetailPage;
