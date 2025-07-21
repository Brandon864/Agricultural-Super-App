import React from "react";
import { Link } from "react-router-dom";
import { useGetCommunitiesQuery } from "../redux/api/communitiesApiSlice"; // Corrected import

function CommunitiesPage() {
  const { data: communities, isLoading, error } = useGetCommunitiesQuery();

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading communities...</p>
      </div>
    );
  }

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
      <h1 className="text-center">All Communities</h1>
      <p className="text-center">
        Browse through agricultural communities or create your own!
      </p>
      <div className="text-center" style={{ marginBottom: "20px" }}>
        <Link to="/communities/create" className="button primary-button">
          Create New Community
        </Link>
      </div>

      {communities && communities.length > 0 ? (
        <div className="community-list-grid">
          {communities.map((community) => (
            <div key={community.id} className="community-list-item card">
              <Link to={`/communities/${community.id}`}>
                <h3>{community.name}</h3>
                <p>{community.description}</p>
                <p>
                  Members: {community.members ? community.members.length : 0}
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
