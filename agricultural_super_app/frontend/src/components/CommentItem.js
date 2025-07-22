import React, { useState } from "react";
import { useSelector } from "react-redux"; // CORRECT: Import useSelector
import {
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useAddCommentToPostMutation, // Using this for replies, as per apiSlice
} from "../redux/api/apiSlice"; // CORRECT: Import from apiSlice

function CommentItem({
  comment,
  postId, // Passed from parent (PostDetailPage)
  commentsMap, // Still needed for recursive rendering
  onReplySuccess, // Callback for parent to re-fetch/update
  level = 0,
}) {
  const { currentUser } = useSelector((state) => state.auth); // CORRECT: Get currentUser from Redux state
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();
  const [addComment, { isLoading: isAddingReply }] =
    useAddCommentToPostMutation(); // Use correct mutation

  // Determine if current user has liked this comment
  // Ensure comment.likes is an array and IDs are comparable (assuming currentUser.id is a number)
  const hasLiked =
    currentUser &&
    comment.likes &&
    Array.isArray(comment.likes) &&
    comment.likes.includes(currentUser.id);

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
      // Ensure the 'commentData' structure matches what your backend expects for 'addCommentToPost'
      await addComment({
        postId: postId,
        commentData: {
          content: replyText, // Using 'content' as per previous discussions for comment text
          parent_comment_id: comment.id, // This comment's ID is the parent_comment_id for the reply
        },
      }).unwrap();
      setReplyText(""); // Clear reply input
      setShowReplyForm(false); // Hide reply form
      if (onReplySuccess) {
        onReplySuccess(); // Callback to potentially re-fetch or update parent state if needed
      }
    } catch (err) {
      console.error("Failed to add reply:", err);
      alert(
        `Failed to add reply: ${err?.data?.message || "Please try again."}`
      );
    }
  };

  const toggleReplyForm = () => {
    if (!currentUser) {
      alert("Please log in to reply to comments.");
      return;
    }
    if (!showReplyForm) {
      // Pre-fill with author's username for tagging
      const authorName = comment.author?.username || comment.author_username; // Use comment.author.username if available
      setReplyText(`@${authorName} `);
    } else {
      setReplyText("");
    }
    setShowReplyForm(!showReplyForm);
  };

  const paddingLeft = `${level * 20}px`; // 20px per level of nesting

  return (
    <div
      className={`comment-item card nested-level-${level}`}
      style={{ paddingLeft: paddingLeft }}
    >
      <p className="comment-author">
        <strong>{comment.author?.username || comment.author_username}</strong>{" "}
        on {new Date(comment.created_at).toLocaleDateString()}
      </p>
      <p className="comment-text">{comment.content || comment.text}</p>{" "}
      {/* Use comment.content or comment.text */}
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
            placeholder={`Reply to ${
              comment.author?.username || comment.author_username
            }...`}
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
