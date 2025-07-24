// src/services/auth.service.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL;

// This service largely overlaps with RTK Query's apiSlice.
// It's recommended to migrate components to use RTK Query hooks (e.g., useLoginMutation).

const register = (username, email, password) => {
  return axios.post(`${API_URL}/register`, { username, email, password });
};

const login = (username, password) => {
  return axios
    .post(`${API_URL}/login`, { username, password })
    .then((response) => {
      if (response.data.access_token) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.access_token);
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
