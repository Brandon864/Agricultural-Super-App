import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux"; // CORRECT: Use useSelector from react-redux

const PrivateRoute = () => {
  // Get token and currentUser from Redux state
  const { token, currentUser } = useSelector((state) => state.auth);

  // If no token or no currentUser, redirect to login
  // We assume that if currentUser is null, the user is not authenticated.
  // isLoading from useAuth() is no longer relevant here as Redux state is immediately available.
  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
