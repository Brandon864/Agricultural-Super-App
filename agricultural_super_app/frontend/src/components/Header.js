// agricultural_super_app/frontend/src/components/Header.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="app-logo">
          Agricultural Super App
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/posts" className="nav-link">
          Posts
        </Link>
        <Link to="/communities" className="nav-link">
          Communities
        </Link>
        {currentUser ? (
          <>
            <Link to="/profile" className="nav-link">
              My Profile
            </Link>{" "}
            {/* Added My Profile link */}
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
      </nav>
    </header>
  );
}

export default Header;
