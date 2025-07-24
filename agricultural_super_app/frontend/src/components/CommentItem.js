// src/components/CommentItem.js
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useAddCommentToPostMutation,
} from "../redux/api/apiSlice";

function CommentItem({
  comment,
  postId,
  commentsMap,
  onReplySuccess,
  level = 0,
}) {
  // Get current user from Redux state
  const { currentUser } = useSelector((state) => state.auth);

  // Local state for reply form visibility and text
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  // RTK Query hooks
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();
  const [addComment, { isLoading: isAddingReply }] =
    useAddCommentToPostMutation();

  // Check if current user has liked this comment
  const hasLiked =
    currentUser &&
    comment.likes &&
    Array.isArray(comment.likes) &&
    comment.likes.includes(currentUser.id);

  // Calculate likes count
  const likesCount = comment.likes ? comment.likes.length : 0;

  // Find direct replies to this comment
  const childrenComments = Object.values(commentsMap)
    .filter((c) => c.parent_comment_id === comment.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Handle like/unlike button click
  const handleLikeClick = async () => {
    if (!currentUser) {
      alert("Please log in to like a comment.");
      return;
    }
    try {
      if (hasLiked) {
        await unlikeComment({ commentId: comment.id });
      } else {
        await likeComment({ commentId: comment.id });
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

  // Handle reply submission
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
      // Corrected payload structure: commentData object is nested
      await addComment({
        postId: postId,
        commentData: {
          text: replyText,
          parent_comment_id: comment.id,
        },
      }).unwrap();

      setReplyText("");
      setShowReplyForm(false);
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (err) {
      console.error("Failed to add reply:", err);
      alert(
        `Failed to add reply: ${err?.data?.message || "Please try again."}`
      );
    }
  };

  // Toggle reply form visibility
  const toggleReplyForm = () => {
    if (!currentUser) {
      alert("Please log in to reply to comments.");
      return;
    }
    if (!showReplyForm) {
      const authorName = comment.author_username;
      setReplyText(`@${authorName} `);
    } else {
      setReplyText("");
    }
    setShowReplyForm(!showReplyForm);
  };

  // Calculate left padding for nested comments
  const paddingLeft = `${level * 20}px`;

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
          onClick={toggleReplyForm}
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
            className="input-field textarea-field"
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
      {childrenComments.length > 0 && (
        <div className="comment-replies">
          {childrenComments.map((childComment) => (
            <CommentItem
              key={childComment.id}
              comment={childComment}
              postId={postId}
              commentsMap={commentsMap}
              onReplySuccess={onReplySuccess}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
