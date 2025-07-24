// src/components/CommentCard.js
import React from "react";
import { useSelector } from "react-redux";
import {
  useLikeCommentMutation, // Hook for liking comments
  useUnlikeCommentMutation, // Hook for unliking comments
} from "../../redux/api/apiSlice";
import Button from "./common/Button/Button"; // Assuming a generic Button component

function CommentCard({ comment }) {
  // Get current user from Redux auth state for like functionality
  const { currentUser } = useSelector((state) => state.auth);
  // RTK Query hooks for liking/unliking comments
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();

  // Handle liking a comment
  const handleLike = () => {
    if (currentUser) {
      likeComment({ commentId: comment.id }); // Call the mutation with comment ID
    } else {
      alert("Please log in to like comments."); // Inform user if not logged in
    }
  };

  // Handle unliking a comment
  const handleUnlike = () => {
    if (currentUser) {
      unlikeComment({ commentId: comment.id }); // Call the mutation with comment ID
    }
  };

  // Check if the current user has liked this comment
  const isLikedByUser =
    currentUser &&
    comment.likes && // Ensure comment.likes exists
    Array.isArray(comment.likes) && // Ensure it's an array
    comment.likes.includes(currentUser.id); // Check if user's ID is in the likes list

  return (
    <div className="comment-card">
      <p className="comment-content">{comment.text}</p>{" "}
      {/* Use comment.text instead of comment.content */}
      <div className="comment-meta">
        <span className="comment-author">By {comment.author_username}</span>
        <span className="comment-date">
          {" "}
          on {new Date(comment.created_at).toLocaleDateString()}
        </span>
        <span className="comment-likes">
          Likes: {comment.likes ? comment.likes.length : 0}
        </span>
        {currentUser && ( // Only show like/unlike button if user is logged in
          <button
            onClick={isLikedByUser ? handleUnlike : handleLike}
            className={`like-button ${isLikedByUser ? "liked" : "not-liked"}`}
          >
            {isLikedByUser ? "Unlike" : "Like"}
          </button>
        )}
      </div>
    </div>
  );
}

export default CommentCard;
