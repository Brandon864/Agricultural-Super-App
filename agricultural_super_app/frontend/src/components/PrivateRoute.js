// src/components/PrivateRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { token, currentUser } = useSelector((state) => state.auth);

  // Check if token exists and if currentUser is a valid object with an ID
  if (
    !token ||
    !currentUser ||
    typeof currentUser !== "object" ||
    !currentUser.id
  ) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
