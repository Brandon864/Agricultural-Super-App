import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useAddCommentMutation, // Need this to add replies
} from "../redux/api/postsApiSlice";

function CommentItem({
  comment,
  postId,
  commentsMap,
  onReplySuccess,
  level = 0,
}) {
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  // Initialize replyText based on whether we are showing the form and tagging
  const [replyText, setReplyText] = useState("");

  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();
  const [addComment, { isLoading: isAddingReply }] = useAddCommentMutation();

  // Determine if current user has liked this comment
  const hasLiked =
    currentUser &&
    comment.likes &&
    comment.likes.includes(Number(currentUser.id)); // <-- Add Number() conversion
  const likesCount = comment.likes ? comment.likes.length : 0;

  // Find children comments for this comment
  const childrenComments = Object.values(commentsMap)
    .filter((c) => c.parent_comment_id === comment.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const handleLikeClick = async () => {
    if (!currentUser) {
      alert("Please log in to like a comment.");
      return;
    }
    try {
      if (hasLiked) {
        await unlikeComment({ commentId: comment.id, postId: postId });
      } else {
        await likeComment({ commentId: comment.id, postId: postId });
      }
    } catch (err) {
      console.error("Failed to update comment like status:", err);
      alert(
        `Could not update comment like status: ${
          err?.data?.message || "Please try again."
        }`
      );
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      alert("Reply cannot be empty.");
      return;
    }
    if (!currentUser) {
      alert("You must be logged in to reply to a comment.");
      return;
    }

    try {
      await addComment({
        postId: postId,
        text: replyText,
        parentCommentId: comment.id, // This comment's ID is the parent_comment_id for the reply
      }).unwrap();
      setReplyText(""); // Clear reply input
      setShowReplyForm(false); // Hide reply form
      if (onReplySuccess) {
        onReplySuccess(); // Callback to potentially re-fetch or update parent state if needed
      }
      // No alert here, as the parent component will re-render
    } catch (err) {
      console.error("Failed to add reply:", err);
      alert(
        `Failed to add reply: ${err?.data?.message || "Please try again."}`
      );
    }
  };

  // NEW: Function to toggle reply form and pre-fill text
  const toggleReplyForm = () => {
    if (!currentUser) {
      alert("Please log in to reply to comments.");
      return;
    }
    if (!showReplyForm) {
      setReplyText(`@${comment.author_username} `); // Pre-fill with username and a space
    } else {
      setReplyText(""); // Clear if hiding
    }
    setShowReplyForm(!showReplyForm); // Toggle visibility
  };

  // Dynamically adjust padding for nested comments
  const paddingLeft = `${level * 20}px`; // 20px per level of nesting

  return (
    <div
      className={`comment-item card nested-level-${level}`}
      style={{ paddingLeft: paddingLeft }}
    >
      <p className="comment-author">
        <strong>{comment.author_username}</strong> on{" "}
        {new Date(comment.created_at).toLocaleDateString()}
      </p>
      <p className="comment-text">{comment.text}</p>
      <div className="comment-actions">
        <button
          onClick={handleLikeClick}
          className={`button comment-like-button ${hasLiked ? "liked" : ""}`}
          disabled={!currentUser}
        >
          {hasLiked ? "❤️" : "🤍"} ({likesCount})
        </button>
        <button
          onClick={toggleReplyForm} // Use the new toggle function
          className="button secondary-button"
          disabled={!currentUser}
        >
          {showReplyForm ? "Cancel Reply" : "Reply"}
        </button>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author_username}...`}
            rows="2"
            required
          ></textarea>
          <button
            type="submit"
            className="button primary-button small-button"
            disabled={isAddingReply}
          >
            {isAddingReply ? "Replying..." : "Submit Reply"}
          </button>
        </form>
      )}

      {/* Recursively render children comments */}
      {childrenComments.length > 0 && (
        <div className="comment-replies">
          {childrenComments.map((childComment) => (
            <CommentItem
              key={childComment.id}
              comment={childComment}
              postId={postId}
              commentsMap={commentsMap} // Pass the full map for recursive finding
              onReplySuccess={onReplySuccess}
              level={level + 1} // Increment level for indentation
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
