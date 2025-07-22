import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux"; // CORRECT: Added for auth state
import {
  useGetCommunityDetailQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../redux/api/apiSlice"; // Assuming these are needed

function CommunityPage() {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.auth); // Get current user from Redux

  const {
    data: community,
    isLoading,
    isError,
    error,
    refetch, // Add refetch to update community data after join/leave
  } = useGetCommunityDetailQuery(id);

  const [joinCommunity] = useJoinCommunityMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();

  const handleJoin = async () => {
    if (currentUser) {
      await joinCommunity(id);
      refetch(); // Refetch community details to update member list
    } else {
      alert("Please log in to join this community.");
    }
  };

  const handleLeave = async () => {
    if (currentUser) {
      await leaveCommunity(id);
      refetch(); // Refetch community details to update member list
    }
  };

  if (isLoading) {
    return <div className="page-container">Loading community...</div>;
  }

  if (isError) {
    return (
      <div className="page-container">
        Error:{" "}
        {error?.data?.message ||
          error?.message ||
          "An unexpected error occurred."}
      </div>
    );
  }

  if (!community) {
    return <div className="page-container">Community not found.</div>;
  }

  // Check if current user is a member (assuming community.members is an array of user objects with 'id')
  const isMember =
    currentUser &&
    community.members &&
    Array.isArray(community.members) &&
    community.members.some((member) => member.id === currentUser.id);

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-4">{community.name}</h1>
      <p className="text-lg text-gray-700 mb-4">{community.description}</p>
      <p className="text-gray-600 mb-2">
        Members: {community.members ? community.members.length : 0}
      </p>
      <p className="text-gray-600 mb-4">
        Created by: {community.creator?.username || "Unknown"}
      </p>{" "}
      {/* Handle potential undefined creator */}
      {currentUser && ( // Show join/leave button only if logged in
        <div className="mb-4">
          {isMember ? (
            <button
              onClick={handleLeave}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Leave Community
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Join Community
            </button>
          )}
        </div>
      )}
      {/* Add a link to create a new post if user is a member */}
      {currentUser && isMember && (
        <Link
          to={`/posts/create?communityId=${community.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block mt-4"
        >
          Create New Post in this Community
        </Link>
      )}
      <h2 className="text-2xl font-bold mt-8 mb-4">Community Posts</h2>
      {community.posts && community.posts.length > 0 ? (
        <ul>
          {community.posts.map((post) => (
            <li
              key={post.id}
              className="bg-gray-100 p-4 rounded-lg shadow mb-3"
            >
              <Link
                to={`/posts/${post.id}`}
                className="text-lg font-semibold hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-600">
                by {post.author?.username || "Unknown"} on{" "}
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts in this community yet.</p>
      )}
    </div>
  );
}

export default CommunityPage;
