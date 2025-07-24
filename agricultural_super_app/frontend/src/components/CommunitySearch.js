// src/components/CommunitySearch.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSearchCommunitiesQuery } from "../redux/api/apiSlice";

function CommunitySearch() {
  const [searchTerm, setSearchTerm] = useState("");

  // RTK Query hook for searching communities. Skips query if searchTerm is empty.
  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    error,
  } = useSearchCommunitiesQuery(searchTerm, {
    skip: !searchTerm.trim(),
  });

  const displayCommunities = searchResults || []; // Ensure searchResults is an array

  return (
    <div className="community-search-page container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Explore Communities</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by community name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {(isLoading || isFetching) && <p className="text-center">Searching...</p>}
      {isError && (
        <p className="text-red-500 text-center">
          Error: {error?.data?.message || "Failed to search communities."}
        </p>
      )}

      {searchTerm.trim() &&
        displayCommunities.length === 0 &&
        !(isLoading || isFetching) &&
        !isError && (
          <p className="text-center text-gray-600">
            No communities found for "{searchTerm}".
          </p>
        )}

      {displayCommunities.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayCommunities.map((community) => (
            <li key={community.id} className="bg-white p-4 rounded shadow-md">
              {/* Link to the CommunityPage for more details */}
              <Link
                to={`/communities/${community.id}`}
                className="text-lg font-semibold text-green-700 hover:underline"
              >
                {community.name}
              </Link>
              <p className="text-gray-600 text-sm mt-1">
                {community.description}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Members: {community.member_count}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommunitySearch;
