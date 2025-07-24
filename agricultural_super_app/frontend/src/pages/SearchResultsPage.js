// src/pages/SearchResultsPage.js (NEW FILE)
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux"; // Needed for follow/unfollow logic
import {
  useSearchUsersQuery,
  useSearchCommunitiesQuery,
  useSearchPostsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../redux/api/apiSlice";

function SearchResultsPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q") || ""; // Get search term from URL query
  const { currentUser } = useSelector((state) => state.auth);

  // Fetch results for each category
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useSearchUsersQuery(searchTerm, { skip: !searchTerm });
  const {
    data: communities,
    isLoading: communitiesLoading,
    isError: communitiesError,
  } = useSearchCommunitiesQuery(searchTerm, { skip: !searchTerm });
  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
  } = useSearchPostsQuery(searchTerm, { skip: !searchTerm });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId).unwrap();
        alert("Unfollowed!");
      } else {
        await followUser(userId).unwrap();
        alert("Followed!");
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      alert(
        `Failed to ${isCurrentlyFollowing ? "unfollow" : "follow"} user: ${
          err.data?.message || err.error
        }`
      );
    }
  };

  if (!searchTerm) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Search Results</h2>
        <p className="text-gray-600">
          Please enter a search term in the navbar to see results.
        </p>
      </div>
    );
  }

  const isLoading = usersLoading || communitiesLoading || postsLoading;
  const isAnyError = usersError || communitiesError || postsError;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading search results...</p>
      </div>
    );
  }

  if (isAnyError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">
          Error loading search results. Please try again.
        </p>
      </div>
    );
  }

  const hasResults =
    users?.length > 0 || communities?.length > 0 || posts?.length > 0;

  return (
    <div className="search-results-page container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Results for "{searchTerm}"</h2>

      {!hasResults && (
        <p className="text-center text-gray-600">
          No results found for "{searchTerm}" across users, communities, or
          posts.
        </p>
      )}

      {/* User Results Section */}
      {users?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Users ({users.length})
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-white p-4 rounded shadow-md flex items-center"
              >
                {user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt={`${user.username}'s profile`}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                    No Img
                  </div>
                )}
                <div className="flex-grow">
                  <Link
                    to={`/users/${user.id}`}
                    className="text-lg font-semibold text-green-700 hover:underline"
                  >
                    {user.username}
                  </Link>
                  <p className="text-gray-600 text-sm">
                    {user.bio || "No bio."}
                  </p>
                </div>
                {currentUser && currentUser.id !== user.id && (
                  <button
                    onClick={() =>
                      handleFollowToggle(
                        user.id,
                        user.is_followed_by_current_user
                      )
                    }
                    className={`ml-4 py-1 px-3 rounded text-white text-sm ${
                      user.is_followed_by_current_user
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {user.is_followed_by_current_user ? "Unfollow" : "Follow"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Community Results Section */}
      {communities?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Communities ({communities.length})
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map((community) => (
              <li key={community.id} className="bg-white p-4 rounded shadow-md">
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
        </div>
      )}

      {/* Post Results Section */}
      {posts?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Posts ({posts.length})
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <li key={post.id} className="bg-white p-4 rounded shadow-md">
                <Link
                  to={`/posts/${post.id}`}
                  className="text-lg font-semibold text-blue-700 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {post.content}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  By {post.author_username} in{" "}
                  {post.community_name || "General"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
