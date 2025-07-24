// src/pages/PostDetailPage.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetPostDetailQuery,
  useAddCommentToPostMutation,
  useGetCommentsForPostQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useFollowCommunityMutation,
  useUnfollowCommunityMutation,
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

  const [followUser, { isLoading: isFollowingUser }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingUser }] =
    useUnfollowUserMutation();
  const [followCommunity, { isLoading: isFollowingCommunity }] =
    useFollowCommunityMutation();
  const [unfollowCommunity, { isLoading: isUnfollowingCommunity }] =
    useUnfollowCommunityMutation();

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
        commentData: { text: newCommentText, parent_comment_id: null },
      }).unwrap();
      setNewCommentText("");
      refetchComments();
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
    } catch (err) {
      console.error("Failed to update post like status:", err);
      alert(
        `Could not update post like status: ${
          err?.data?.message || "Please try again."
        }`
      );
    }
  };

  const handleFollowUser = async () => {
    if (!currentUser) {
      alert("Please log in to follow users.");
      return;
    }
    if (currentUser.id === post.author.id) {
      alert("You cannot follow yourself.");
      return;
    }
    try {
      if (post.author.is_following) {
        await unfollowUser(post.author.id).unwrap();
        console.log("Unfollowed user:", post.author.username);
      } else {
        await followUser(post.author.id).unwrap();
        console.log("Followed user:", post.author.username);
      }
    } catch (err) {
      console.error("Failed to update user follow status:", err);
      alert(
        `Could not update user follow status: ${
          err?.data?.message || "Please try again."
        }`
      );
    }
  };

  const handleFollowCommunity = async () => {
    if (!currentUser) {
      alert("Please log in to follow communities.");
      return;
    }
    if (!post.community || !post.community.id) {
      alert("No community found for this post to follow.");
      return;
    }
    try {
      if (post.community.is_followed) {
        await unfollowCommunity(post.community.id).unwrap();
        console.log("Unfollowed community:", post.community.name);
      } else {
        await followCommunity(post.community.id).unwrap();
        console.log("Followed community:", post.community.name);
      }
    } catch (err) {
      console.error("Failed to update community follow status:", err);
      alert(
        `Could not update community follow status: ${
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

  const authorExists = post && post.author;
  const communityExists = post && post.community && post.community.id;

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
          By{" "}
          <strong>
            {authorExists ? (
              <Link
                to={`/users/${post.author.id}`}
                className="hover:underline text-blue-500"
              >
                {post.author.username}
              </Link>
            ) : (
              "Unknown"
            )}
          </strong>{" "}
          {authorExists && currentUser && currentUser.id !== post.author.id && (
            <button
              onClick={handleFollowUser}
              className={`button ml-2 text-sm px-2 py-1 rounded-md ${
                post.author.is_following
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              disabled={isFollowingUser || isUnfollowingUser}
            >
              {post.author.is_following ? "Following" : "Follow"} (
              {post.author.followers_count || 0})
            </button>
          )}
          on {new Date(post.created_at).toLocaleDateString()}{" "}
        </p>

        {post.image_url && (
          <div className="post-detail-image-container">
            <img
              src={post.image_url}
              alt={post.title}
              className="post-detail-image"
              onError={(e) => {
                e.target.onerror = null;
                console.error(
                  `Failed to load image for post ${post.id}: ${post.image_url}`
                );
              }}
            />
          </div>
        )}

        {communityExists ? (
          <p className="text-gray-600 mb-4">
            Community:{" "}
            <Link
              to={`/communities/${post.community.id}`}
              className="hover:underline text-blue-500"
            >
              {post.community.name}
            </Link>
            {currentUser && (
              <button
                onClick={handleFollowCommunity}
                className={`button ml-2 text-sm px-2 py-1 rounded-md ${
                  post.community.is_followed
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                disabled={isFollowingCommunity || isUnfollowingCommunity}
              >
                {post.community.is_followed ? "Following" : "Follow"} (
                {post.community.followers_count || 0})
              </button>
            )}
          </p>
        ) : (
          <p className="text-gray-600 mb-4">Community: N/A</p>
        )}
        {/* --- UPDATE START: Wrap content with post-body and use dangerouslySetInnerHTML --- */}
        <div
          className="post-detail-content post-body" // Add post-body class here
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>
        {/* --- UPDATE END --- */}
        <div className="post-actions">
          <button
            onClick={handlePostLikeClick}
            className={`button post-like-button ${postHasLiked ? "liked" : ""}`}
            disabled={!currentUser}
          >
            {postHasLiked ? "❤️" : "🤍"} ({postLikesCount}){" "}
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
            className="input-field textarea-field"
          ></textarea>
          <button
            type="submit"
            className="button primary-button"
            disabled={isAddingComment || !currentUser}
          >
            {isAddingComment ? "Adding..." : "Add Comment"}{" "}
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
