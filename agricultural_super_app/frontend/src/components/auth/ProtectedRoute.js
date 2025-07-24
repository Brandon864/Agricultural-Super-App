// src/components/auth/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import our AuthContext hook

const ProtectedRoute = () => {
  // Get authentication status and loading state from AuthContext
  const { isLoggedIn, loading } = useAuth();

  // While checking authentication status, display a loading message
  if (loading) {
    return (
      <div className="loading-message">Loading authentication...</div> // Use a loading message class
    );
  }

  // If user is logged in, render the child routes (Outlet)
  // Otherwise, redirect them to the login page
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
