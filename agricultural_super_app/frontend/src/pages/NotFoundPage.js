import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="page-container text-center">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="button primary-button">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
