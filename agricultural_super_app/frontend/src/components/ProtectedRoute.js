// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import our custom AuthContext hook

const ProtectedRoute = () => {
 
  const { isLoggedIn, loading } = useAuth();

  // For debugging: log the current authentication status.
  console.log(
    "ProtectedRoute Render - Loading:",
    loading,
    "IsLoggedIn:",
    isLoggedIn
  );

  // If the authentication status is still loading, display a loading message.
  // This prevents the component from redirecting before the auth check is complete.
  if (loading) {
    return (
      <div className="loading-message">Loading authentication...</div> 
    );
  }

  
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
