// src/pages/CommunityPage.js
import React, { useState } from "react"; // Import useState for form inputs
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCommunityDetailQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useCreatePostMutation, // Import the createPost mutation hook
} from "../redux/api/apiSlice";

function CommunityPage() {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.auth);

  // State for new post form
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false); // State to toggle form visibility

  const {
    data: community,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCommunityDetailQuery(id);

  const [joinCommunity] = useJoinCommunityMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation(); // Get the createPost function and its loading state

  const handleJoin = async () => {
    if (currentUser) {
      try {
        await joinCommunity(id).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to join community:", err);
        alert(err?.data?.message || "Failed to join community.");
      }
    } else {
      alert("Please log in to join this community.");
    }
  };

  const handleLeave = async () => {
    if (currentUser) {
      try {
        await leaveCommunity(id).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to leave community:", err);
        alert(err?.data?.message || "Failed to leave community.");
      }
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!currentUser) {
      alert("You must be logged in to create a post.");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Post title and content cannot be empty.");
      return;
    }

    try {
      await createPost({
        title: newPostTitle,
        content: newPostContent,
        community_id: parseInt(id), // Ensure it's an integer, as expected by backend
      }).unwrap();

      setNewPostTitle(""); // Clear form fields on success
      setNewPostContent("");
      setShowPostForm(false); // Hide the form after posting
      // No need for explicit refetch here, invalidatesTags in apiSlice handles it
      alert("Post created successfully!");
    } catch (err) {
      console.error("Failed to create post:", err);
      alert(err?.data?.message || "Failed to create post.");
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

  const isMember =
    currentUser &&
    community.members &&
    Array.isArray(community.members) &&
    community.members.some((member) => member.id === currentUser.id); // Check if current user is a member object

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-4">{community.name}</h1>
      <p className="text-lg text-gray-700 mb-4">{community.description}</p>
      <p className="text-gray-600 mb-2">
        Members: {community.members ? community.members.length : 0}
      </p>
      <p className="text-gray-600 mb-4">
        Created by: {community.owner_username || "Unknown"}
      </p>{" "}
      {/* Changed creator?.username to owner_username based on community object structure */}
      {currentUser && (
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
      {/* NEW: Section for creating a post */}
      {currentUser &&
        isMember && ( // Only show if logged in AND a member
          <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              Create a New Post in {community.name}
            </h2>
            {!showPostForm ? (
              <button
                onClick={() => setShowPostForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Start New Post
              </button>
            ) : (
              <form onSubmit={handleCreatePost}>
                <div className="mb-4">
                  <label
                    htmlFor="postTitle"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Title:
                  </label>
                  <input
                    type="text"
                    id="postTitle"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    disabled={isCreatingPost}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="postContent"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Content:
                  </label>
                  <textarea
                    id="postContent"
                    rows="5"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={isCreatingPost}
                    required
                  ></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isCreatingPost}
                  >
                    {isCreatingPost ? "Posting..." : "Create Post"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isCreatingPost}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      {/* Existing Community Posts section */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Community Posts</h2>
      {community.posts && community.posts.length > 0 ? (
        <ul>
          {/* Ensure post.id is unique for keys */}
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
