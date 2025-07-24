// src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import our custom AuthContext hook
import "../App.css"; // Import global CSS for styling

function Header() {
  // Get the current user object and the logout function from AuthContext.
  const { currentUser, logout } = useAuth();
  // Hook to programmatically navigate between routes.
  const navigate = useNavigate();

  // Handler for the logout button click.
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext (clears local storage).
    navigate("/login"); // Redirect to the login page after logging out.
  };

  return (
    <header className="app-header">
      {" "}
      {/* Main header container */}
      <div className="header-left">
        <Link to="/" className="app-logo">
          {" "}
          {/* Logo/App Title link */}
          Agricultural Super App
        </Link>
      </div>
      <nav className="header-nav">
        {" "}
        {/* Navigation links container */}
        <Link to="/posts" className="nav-link">
          {" "}
          {/* Link to Posts page */}
          Posts
        </Link>
        <Link to="/communities" className="nav-link">
          {" "}
          {/* Link to Communities page */}
          Communities
        </Link>
        {/* Conditional rendering based on whether a user is logged in */}
        {currentUser ? (
          // If user is logged in, show profile link, welcome message, and logout button
          <>
            <Link to="/profile" className="nav-link">
              {" "}
              {/* Link to My Profile */}
              My Profile
            </Link>{" "}
            <span className="welcome-message">
              {" "}
              {/* Welcome message */}
              Welcome, {currentUser.username}!
            </span>
            <button
              onClick={handleLogout}
              className="button secondary-button header-button" // Apply button styles
            >
              Logout
            </button>
          </>
        ) : (
          // If no user is logged in, show Login and Register links
          <>
            <Link to="/login" className="nav-link">
              {" "}
              {/* Link to Login page */}
              Login
            </Link>
            <Link to="/register" className="nav-link">
              {" "}
              {/* Link to Register page */}
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
