import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; // Link removed
import { useAuth } from "../context/AuthContext";
import {
  useGetPostQuery,
  useAddCommentMutation,
  useGetCommentsByPostIdQuery,
  useLikePostMutation,
  useUnlikePostMutation,
} from "../redux/api/postsApiSlice";
import CommentItem from "../components/CommentItem";

function PostDetailPage() {
  const { id: postId } = useParams();
  const { currentUser } = useAuth();
  const [newCommentText, setNewCommentText] = useState("");
  const commentsEndRef = useRef(null); // Ref to scroll to new comments

  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
    // refetch: refetchPost, // Removed as it's not explicitly used
  } = useGetPostQuery(postId);
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments,
  } = useGetCommentsByPostIdQuery(postId);

  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  useEffect(() => {
    // Scroll to the latest comment when new comments are added
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]); // Depend on comments array changing

  if (isLoadingPost)
    return <div className="loading-message">Loading post...</div>;
  if (postError)
    return (
      <div className="error-message">
        Error loading post: {postError?.data?.message || "Please try again."}
      </div>
    );
  if (!post) return <div className="info-message">Post not found.</div>;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    if (!currentUser) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      // For a top-level comment, parentCommentId is implicitly null
      await addComment({
        postId,
        text: newCommentText,
        parentCommentId: null,
      }).unwrap(); // Explicitly pass null
      setNewCommentText("");
      // refetchComments() is handled by RTK Query cache invalidation
      // The optimistic update in postsApiSlice means we don't need a direct refetch here
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert(
        `Failed to add comment: ${err?.data?.message || "Please try again."}`
      );
    }
  };

  const handlePostLikeClick = async () => {
    if (!currentUser) {
      alert("Please log in to like a post.");
      return;
    }
    try {
      const currentUserIdNum = Number(currentUser.id);
      const hasLiked = post.likes && post.likes.includes(currentUserIdNum);

      if (hasLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
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
    currentUser && post.likes && post.likes.includes(Number(currentUser.id));
  const postLikesCount = post.likes ? post.likes.length : 0;

  const buildCommentTree = (flatComments) => {
    const commentsById = {};
    const rootComments = [];

    flatComments.forEach((comment) => {
      commentsById[comment.id] = { ...comment, children: [] };
    });

    Object.values(commentsById).forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentsById[comment.parent_comment_id];
        if (parent) {
          parent.children.push(comment);
        } else {
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    const sortComments = (commentsArr) => {
      commentsArr.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      commentsArr.forEach((comment) => {
        if (comment.children.length > 0) {
          sortComments(comment.children);
        }
      });
    };

    sortComments(rootComments);
    return rootComments;
  };

  const commentsMap = {};
  comments.forEach((c) => (commentsMap[c.id] = c));

  const hierarchicalComments = buildCommentTree(comments);

  return (
    <div className="post-detail-page-container">
      <div className="post-detail-card card">
        <h1 className="post-detail-title">{post.title}</h1>
        <p className="post-detail-meta">
          By <strong>{post.author_username}</strong> on{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </p>
        <div className="post-detail-content">
          <p>{post.content}</p>
        </div>
        <div className="post-actions">
          <button
            onClick={handlePostLikeClick}
            className={`button post-like-button ${postHasLiked ? "liked" : ""}`}
            disabled={!currentUser}
          >
            {postHasLiked ? "❤️" : "🤍"} ({postLikesCount})
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        {isLoadingComments ? (
          <div className="loading-message">Loading comments...</div>
        ) : commentsError ? (
          <div className="error-message">
            Error loading comments:{" "}
            {commentsError?.data?.message || "Please try again."}
          </div>
        ) : comments.length === 0 ? (
          <div className="info-message">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="comments-list">
            {hierarchicalComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                commentsMap={commentsMap}
                onReplySuccess={refetchComments}
                level={0}
              />
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows="4"
            required
            disabled={!currentUser}
          ></textarea>
          <button
            type="submit"
            className="button primary-button"
            disabled={isAddingComment || !currentUser}
          >
            {isAddingComment ? "Adding..." : "Add Comment"}
          </button>
          {!currentUser && (
            <p className="login-prompt">Please log in to add comments.</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default PostDetailPage;
