import React from "react";
import "../../App.css";

function CommentCard({ comment }) {
  return (
    <div className="comment-card">
      <p className="comment-content">{comment.content}</p>
      <div className="comment-meta">
        <span className="comment-author">By {comment.author_username}</span>
        <span className="comment-date">
          {" "}
          on {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default CommentCard;
