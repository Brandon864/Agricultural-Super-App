import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useLikePostMutation,
  useUnlikePostMutation,
} from "../../redux/api/apiSlice";

function PostCard({ post }) {
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL
  const { currentUser } = useSelector((state) => state.auth);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  // NOW, perform conditional rendering based on the 'post' prop
  if (!post) {
    console.warn(
      "PostCard received a null or undefined post prop, skipping render."
    );
    return null; // Return null if post is not valid
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

  const isLikedByUser =
    currentUser &&
    post.likes &&
    Array.isArray(post.likes) &&
    post.likes.includes(currentUser.id);

  const authorDisplayName = post.author_username || "Anonymous";
  const commentsCount = post.comments_count || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h3 className="text-xl font-bold mb-2">
        <Link
          to={`/posts/${post.id}`}
          className="text-green-700 hover:underline"
        >
          {post.title}
        </Link>
      </h3>
      <p className="text-gray-700 mb-3">{post.content.substring(0, 150)}...</p>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Author: {authorDisplayName}</span>
        <span>Comments: {commentsCount}</span>
        <span>Likes: {post.likes ? post.likes.length : 0}</span>{" "}
        {currentUser && (
          <button
            onClick={isLikedByUser ? handleUnlike : handleLike}
            className={`ml-4 px-3 py-1 rounded text-white text-sm ${
              isLikedByUser
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLikedByUser ? "Unlike" : "Like"}
          </button>
        )}
      </div>
    </div>
  );
}

export default PostCard;
