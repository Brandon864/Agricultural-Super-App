// src/pages/CommunitiesPage.js
import React from "react";
import { Link } from "react-router-dom"; // For navigation links
import { useGetCommunitiesQuery } from "../redux/api/communitiesApiSlice"; // RTK Query hook for fetching communities

function CommunitiesPage() {
  // Use the RTK Query hook to fetch all communities.
  // data: communities renames the fetched data, isLoading is true while fetching, error holds any error.
  const { data: communities, isLoading, error } = useGetCommunitiesQuery();

  // Show a loading message while the communities data is being fetched.
  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading communities...</p>
      </div>
    );
  }

  // Show an error message if there was a problem fetching communities.
  if (error) {
    return (
      <div className="page-container">
        <p className="error">
          Error loading communities: {error.message || JSON.stringify(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {" "}
      {/* Main container for the communities page */}
      <h1 className="text-center">All Communities</h1>
      <p className="text-center">
        Browse through agricultural communities or create your own!
      </p>
      <div className="text-center" style={{ marginBottom: "20px" }}>
        {/* Link to the community creation page */}
        <Link to="/communities/create" className="button primary-button">
          Create New Community
        </Link>
      </div>
      {/* Conditionally render communities if data exists, otherwise show a message */}
      {communities && communities.length > 0 ? (
        <div className="community-list-grid">
          {" "}
          {/* Grid layout for community cards */}
          {communities.map((community) => (
            <div key={community.id} className="community-list-item card">
              {" "}
              {/* Card for each community */}
              <Link to={`/communities/${community.id}`}>
                {" "}
                {/* Link to individual community page */}
                <h3>{community.name}</h3> {/* Community name */}
                <p>{community.description}</p> {/* Community description */}
                <p>
                  Members: {community.members ? community.members.length : 0}{" "}
                  {/* Number of members */}
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No communities available yet.</p>
      )}
    </div>
  );
}

export default CommunitiesPage;
