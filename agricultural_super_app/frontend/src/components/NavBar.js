import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Agricultural Super App
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/communities" className="nav-link">
          Communities
        </Link>
        {currentUser ? (
          <>
            <Link to="/profile" className="nav-link">
              My Profile
            </Link>
            <span className="welcome-message">
              Welcome, {currentUser.username}!
            </span>
            <button
              onClick={handleLogout}
              className="button secondary-button header-button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
