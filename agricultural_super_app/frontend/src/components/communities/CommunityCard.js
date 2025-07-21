import React from "react";
import { Link } from "react-router-dom";
import "../../App.css";

function CommunityCard({ community }) {
  return (
    <div className="community-card">
      <Link
        to={`/communities/${community.id}`}
        className="community-title-link"
      >
        <h3>{community.name}</h3>
      </Link>
      <p className="community-description">{community.description}</p>
      <div className="community-meta">
        <span>Members: {community.member_count}</span>
        <span>
          Created: {new Date(community.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default CommunityCard;
