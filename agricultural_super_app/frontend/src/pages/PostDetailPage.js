import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetPostDetailQuery,
  useAddCommentToPostMutation,
  useGetCommentsForPostQuery,
  useLikePostMutation,
  useUnlikePostMutation,
} from "../redux/api/apiSlice";
import CommentItem from "../components/CommentItem";

function PostDetailPage() {
  const { id: postId } = useParams();
  const { currentUser } = useSelector((state) => state.auth);
  const [newCommentText, setNewCommentText] = useState("");
  const commentsEndRef = useRef(null);

  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
    refetch: refetchPostDetail,
  } = useGetPostDetailQuery(postId);

  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments,
  } = useGetCommentsForPostQuery(postId);

  const [addComment, { isLoading: isAddingComment }] =
    useAddCommentToPostMutation();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

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
      await addComment({
        postId,
        commentData: { text: newCommentText, parent_comment_id: null }, // Changed 'content' to 'text' based on your Comment model
      }).unwrap();
      setNewCommentText("");
      refetchComments();
      refetchPostDetail();
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
      const isLikedByUser =
        post.likes &&
        Array.isArray(post.likes) &&
        post.likes.includes(currentUser.id);

      if (isLikedByUser) {
        await unlikePost({ postId });
      } else {
        await likePost({ postId });
      }
      refetchPostDetail();
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
    currentUser &&
    post.likes &&
    Array.isArray(post.likes) &&
    post.likes.includes(currentUser.id);
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
          By <strong>{post.author_username || "Unknown"}</strong> on{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </p>
        {/*
          CRITICAL FIX: Conditionally render the community link.
          This prevents errors if 'post.community' is undefined.
          You should still re-enable the community relationship in app.py if posts
          are meant to have communities.
        */}
        {post.community && post.community.id && post.community.name ? (
          <p className="text-gray-600 mb-4">
            Community:{" "}
            <Link
              to={`/communities/${post.community.id}`}
              className="hover:underline text-blue-500"
            >
              {post.community.name}
            </Link>
          </p>
        ) : (
          // Optional: Display a message or nothing if no community is associated
          <p className="text-gray-600 mb-4">Community: N/A</p>
        )}

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
            <p className="login-prompt">
              Please{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                log in
              </Link>{" "}
              to add comments.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default PostDetailPage;
