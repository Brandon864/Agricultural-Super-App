// src/components/posts/PostCard.js
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useLikePostMutation,
  useUnlikePostMutation,
} from "../../redux/api/apiSlice";
import "../../App.css";

function PostCard({ post }) {
  const { currentUser } = useSelector((state) => state.auth);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  if (!post) {
    console.warn("PostCard received a null or undefined post prop.");
    return null;
  }

  const handleLike = () => {
    if (currentUser) {
      likePost({ postId: post.id });
    } else {
      alert("Please log in to like a post.");
    }
  };

  const handleUnlike = () => {
    if (currentUser) {
      unlikePost({ postId: post.id });
    }
  };

  // Check if the current user has liked this post (assuming post.likes is an array of user objects or IDs)
  // Your backend Post.to_dict() returns a list of user IDs for likes, so this is correct for that.
  const isLikedByUser =
    currentUser &&
    post.likes &&
    Array.isArray(post.likes) &&
    post.likes.includes(currentUser.id);

  const authorDisplayName = post.author_username || "Anonymous";

  return (
    <div className="post-card">
      <h3 className="post-card-title">
        <Link to={`/posts/${post.id}`} className="post-card-title-link">
          {post.title}
        </Link>
      </h3>
      <p className="post-card-content-excerpt">
        {post.content.substring(0, 150)}...
      </p>
      <div className="post-meta-flex">
        <span>Author: {authorDisplayName}</span>
        <span>Likes: {post.likes ? post.likes.length : 0}</span>
        {currentUser && (
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

export default PostCard;
