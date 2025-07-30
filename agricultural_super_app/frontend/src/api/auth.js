// src/api/auth.js
const API_BASE_URL = "http://localhost:5000/api";

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  const data = await response.json();
  return data;
};

export const logoutUser = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return { message: "Already logged out" };
  }

  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  localStorage.removeItem("access_token");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Logout failed");
  }

  const data = await response.json();
  return data;
};

export const getLoggedInUserProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to fetch logged-in user profile"
    );
  }

  const data = await response.json();
  return data;
};

export const getUserProfileById = async (userId, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Failed to fetch user ${userId} profile`
    );
  }

  const data = await response.json();
  return data;
};
