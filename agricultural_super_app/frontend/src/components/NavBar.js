import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/api/apiSlice";
import { logout } from "../redux/auth/authSlice"; // Corrected import path: removed 'features/'
import "../App.css";

function Navbar() {
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Agricultural Super App
      </Link>
      <div className="nav-links">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/posts" className="nav-link">
          Posts
        </NavLink>
        <NavLink to="/communities" className="nav-link">
          Communities
        </NavLink>
        <NavLink to="/marketplace" className="nav-link">
          Marketplace
        </NavLink>

        {currentUser && (
          <NavLink to="/messaging" className="nav-link">
            Messages
          </NavLink>
        )}

        <form onSubmit={handleSearch} className="search-form-navbar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-navbar"
          />
          <button
            type="submit"
            className="search-button-navbar"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="search-icon-navbar"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>

        {currentUser ? (
          <div className="dropdown">
            <button
              onClick={toggleDropdown}
              className="nav-link dropdown-toggle"
            >
              {currentUser.username}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <NavLink
                  to="/profile"
                  className="dropdown-item"
                  onClick={toggleDropdown}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className="dropdown-item"
                  onClick={toggleDropdown}
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleDropdown();
                  }}
                  className="dropdown-item logout-button"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
            <NavLink to="/register" className="nav-link">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
