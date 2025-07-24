// src/pages/SinglePostPage.js
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useGetSinglePostQuery,
  useDeletePostMutation,
  useGetCommentsByPostIdQuery,
  useAddCommentToPostMutation,
} from "../redux/api/apiSlice";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function SinglePostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");
  const [addCommentStatus, setAddCommentStatus] = useState("");

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = useGetSinglePostQuery(postId);

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
    refetch: refetchComments,
  } = useGetCommentsByPostIdQuery(postId);

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [addComment, { isLoading: isAddingComment }] =
    useAddCommentToPostMutation();

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId).unwrap();
        setDeleteStatus("Post deleted successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (err) {
        setDeleteStatus(
          `Failed to delete post: ${err?.data?.message || "Error"}`
        );
        console.error("Failed to delete post:", err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setAddCommentStatus("");

    if (!commentContent.trim()) {
      setAddCommentStatus("Comment cannot be empty.");
      return;
    }
    if (!currentUser) {
      setAddCommentStatus("You must be logged in to comment.");
      return;
    }
    try {
      // MODIFIED: Changed 'content' to 'text' to match backend expectation
      await addComment({
        postId,
        commentData: { text: commentContent },
      }).unwrap();
      setAddCommentStatus("Comment added successfully!");
      setCommentContent("");
      refetchComments();
      setTimeout(() => setAddCommentStatus(""), 3000);
    } catch (err) {
      setAddCommentStatus(
        `Failed to add comment: ${err?.data?.message || "Error"}`
      );
      console.error("Failed to add comment:", err);
    }
  };

  if (isPostLoading) {
    return <div className="page-container">Loading post details...</div>;
  }

  if (isPostError) {
    return (
      <div className="page-container error-message">
        <p>
          Error loading post:{" "}
          {postError?.data?.message || "Something went wrong."}
        </p>
        <p>This post might not exist or there was a network error.</p>
      </div>
    );
  }

  if (!post) {
    return <div className="page-container">Post not found.</div>;
  }

  const isAuthor = currentUser && currentUser.id === post.author_id;

  return (
    <div className="page-container single-post-container">
      <h2>{post.title}</h2>
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="single-post-image"
        />
      )}
      <p className="single-post-content">{post.content}</p>
      <div className="single-post-meta">
        <p>
          By: {post.author_username} on{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </p>
        {post.created_at !== post.updated_at && (
          <p>
            (Last updated: {new Date(post.updated_at).toLocaleDateString()})
          </p>
        )}
      </div>
      {isAuthor && (
        <div className="single-post-actions">
          <Link to={`/posts/${post.id}/edit`} className="button primary-button">
            Edit Post
          </Link>
          <button
            onClick={handleDeletePost}
            className="button secondary-button"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      )}
      {deleteStatus && (
        <p
          className={`message ${
            deleteStatus.includes("successfully") ? "success" : "error"
          }`}
        >
          {deleteStatus}
        </p>
      )}
      <div className="comments-section">
        <h3>Comments ({comments?.length || 0})</h3>
        {isCommentsLoading && <p>Loading comments...</p>}
        {isCommentsError && (
          <p className="error-message">
            Error loading comments:{" "}
            {commentsError?.data?.message || "Something went wrong."}
          </p>
        )}
        {!isCommentsLoading &&
          !isCommentsError &&
          comments &&
          comments.length === 0 && (
            <p>No comments yet. Be the first to comment!</p>
          )}
        <div className="comments-list">
          {!isCommentsLoading &&
            comments &&
            comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <p className="comment-author">{comment.author_username}</p>
                <p className="comment-content">{comment.content}</p>
                <p className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            ))}
        </div>
        <div className="add-comment-form">
          <h4>Add a Comment</h4>
          <form onSubmit={handleAddComment}>
            <textarea
              placeholder="Write your comment here..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={isAddingComment || !currentUser}
              className="input-field textarea-field"
            ></textarea>
            <button
              type="submit"
              className="button primary-button"
              disabled={isAddingComment || !currentUser}
            >
              {isAddingComment ? "Adding..." : "Submit Comment"}
            </button>
          </form>
          {!currentUser && (
            <p className="message error">
              Please <Link to="/login">log in</Link> to add a comment.
            </p>
          )}
          {addCommentStatus && (
            <p
              className={`message ${
                addCommentStatus.includes("successfully") ? "success" : "error"
              }`}
            >
              {addCommentStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePostPage;
