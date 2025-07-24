// src/pages/NotFoundPage.js
import React from "react";
import { Link } from "react-router-dom"; // For navigation links

function NotFoundPage() {
  return (
    <div className="page-container text-center">
      {" "}
      {/* Centered content on the page */}
      <h1>404 - Page Not Found</h1> {/* Main heading for the error */}
      <p>Sorry, the page you are looking for does not exist.</p>{" "}
      {/* Explanatory message */}
      <Link to="/" className="button primary-button">
        {" "}
        {/* Link to redirect to the home page */}
        Go to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
