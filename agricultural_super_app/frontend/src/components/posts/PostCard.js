import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useLikePostMutation,
  useUnlikePostMutation,
} from "../../redux/api/postsApiSlice";

function PostCard({ post }) {
  const { currentUser } = useAuth();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  const handlePostLikeClick = async () => {
    if (!currentUser) {
      alert("Please log in to like a post.");
      return;
    }
    try {
      const currentUserIdNum = Number(currentUser.id); // <-- Add this for safety
      const hasLiked = post.likes && post.likes.includes(currentUserIdNum); // <-- Use the number version
      if (hasLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (err) {
      console.error("Failed to update post like status:", err);
      alert(
        `Could not update post like status: ${
          err?.data?.message || "Please try again."
        }`
      );
    }
  };

  const postHasLiked =
    currentUser && post.likes && post.likes.includes(Number(currentUser.id)); // <-- Add Number() conversion
  const postLikesCount = post.likes ? post.likes.length : 0;

  return (
    <div className="post-card card">
      <Link to={`/posts/${post.id}`} className="post-card-link">
        <h3 className="post-card-title">{post.title}</h3>
        {/*
        CRITICAL: post.community_name is not available from backend Post.to_dict()
        unless you add community_id to Post model and fetch community name in to_dict.
        For now, I'm removing this to prevent errors.
        */}
        <p className="post-card-meta">
          By <strong>{post.author_username}</strong> on{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </p>
        <p className="post-card-content">{post.content.substring(0, 100)}...</p>{" "}
        {/* Truncate content */}
      </Link>
      <div className="post-card-actions">
        <button
          onClick={handlePostLikeClick}
          className={`button post-like-button ${postHasLiked ? "liked" : ""}`}
          disabled={!currentUser}
        >
          {postHasLiked ? "❤️" : "🤍"} ({postLikesCount})
        </button>
        <Link to={`/posts/${post.id}`} className="button secondary-button">
          View Post
        </Link>
      </div>
    </div>
  );
}

export default PostCard;
