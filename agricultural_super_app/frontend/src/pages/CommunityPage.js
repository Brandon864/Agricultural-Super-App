import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useGetCommunityQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "../redux/api/communitiesApiSlice"; // Corrected import
import {
  useCreatePostMutation,
  useGetPostsQuery,
} from "../redux/api/postsApiSlice"; // Corrected import

function CommunityPage() {
  const { id } = useParams();
  const { currentUser, refetchUser } = useAuth();
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const [joinLeaveMessage, setJoinLeaveMessage] = useState("");

  const {
    data: community,
    isLoading: isCommunityLoading,
    error: communityError,
    refetch: refetchCommunity,
  } = useGetCommunityQuery(id);
  const {
    data: posts,
    isLoading: isPostsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useGetPostsQuery();

  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] =
    useLeaveCommunityMutation();
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();

  const isMember =
    currentUser &&
    community?.members?.some((member) => member.id === currentUser.id);

  const handleJoinLeaveCommunity = async () => {
    if (!currentUser) {
      setJoinLeaveMessage("Please log in to join or leave a community.");
      return;
    }

    setJoinLeaveMessage("");
    try {
      if (isMember) {
        await leaveCommunity({
          communityId: id,
          userId: currentUser.id,
        }).unwrap();
        setJoinLeaveMessage("Successfully left the community!");
      } else {
        await joinCommunity({
          communityId: id,
          userId: currentUser.id,
        }).unwrap();
        setJoinLeaveMessage("Successfully joined the community!");
      }
      refetchCommunity();
      refetchUser();
    } catch (err) {
      console.error("Failed to update community membership:", err);
      setJoinLeaveMessage(
        err.data?.message || "Failed to update community membership."
      );
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setPostMessage("Please log in to create a post.");
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      setPostMessage("Title and content cannot be empty.");
      return;
    }
    setPostMessage("");

    try {
      await createPost({
        title: postTitle,
        content: postContent,
        author_id: currentUser.id,
        community_id: id,
      }).unwrap();
      setPostMessage("Post created successfully!");
      setPostTitle("");
      setPostContent("");
      refetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
      setPostMessage(err.data?.message || "Failed to create post.");
    }
  };

  if (isCommunityLoading || isPostsLoading) {
    return (
      <div className="page-container">
        <p>Loading community...</p>
      </div>
    );
  }

  if (communityError) {
    return (
      <div className="page-container">
        <p className="error">
          Error loading community:{" "}
          {communityError.message || JSON.stringify(communityError)}
        </p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="page-container">
        <p>Community not found.</p>
      </div>
    );
  }

  const communityPosts = posts
    ? posts.filter((post) => post.community_id === community.id)
    : [];

  return (
    <div className="page-container">
      <div className="community-header">
        <h1>{community.name}</h1>
        <p>{community.description}</p>
        <p className="community-details">
          Created: {new Date(community.created_at).toLocaleDateString()} |
          Members: {community.members ? community.members.length : 0}
        </p>
        {currentUser && (
          <button
            onClick={handleJoinLeaveCommunity}
            className={`button ${
              isMember ? "danger-button" : "primary-button"
            }`}
            disabled={isJoining || isLeaving}
          >
            {isJoining || isLeaving
              ? "Processing..."
              : isMember
              ? "Leave Community"
              : "Join Community"}
          </button>
        )}
        {joinLeaveMessage && (
          <p
            className={`message ${
              joinLeaveMessage.includes("successfully") ? "success" : "error"
            }`}
          >
            {joinLeaveMessage}
          </p>
        )}
      </div>

      <div className="community-posts-section">
        <h2>Community Discussions</h2>
        {currentUser && isMember && (
          <div className="add-post-section">
            <h3>Create a New Post</h3>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Post Title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  disabled={isCreatingPost}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  className="textarea-field"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows="5"
                  disabled={isCreatingPost}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="button primary-button"
                disabled={isCreatingPost}
              >
                {isCreatingPost ? "Creating Post..." : "Create Post"}
              </button>
              {postMessage && (
                <p
                  className={`message ${
                    postMessage.includes("successfully") ? "success" : "error"
                  }`}
                >
                  {postMessage}
                </p>
              )}
            </form>
          </div>
        )}

        {isPostsLoading ? (
          <p>Loading posts...</p>
        ) : postsError ? (
          <p className="error">
            Error loading posts:{" "}
            {postsError.message || JSON.stringify(postsError)}
          </p>
        ) : communityPosts.length > 0 ? (
          <ul className="post-list">
            {communityPosts.map((post) => (
              <li key={post.id} className="post-item">
                <Link to={`/posts/${post.id}`}>
                  <h3>{post.title}</h3>
                  <p>
                    By {post.author_username} on{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts in this community yet.</p>
        )}
      </div>

      <div className="community-members-section">
        <h2>Members</h2>
        {community.members && community.members.length > 0 ? (
          <ul className="member-list">
            {community.members.map((member) => (
              <li key={member.id}>{member.username}</li>
            ))}
          </ul>
        ) : (
          <p>No members yet.</p>
        )}
      </div>
    </div>
  );
}

export default CommunityPage;
