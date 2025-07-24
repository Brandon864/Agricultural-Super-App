// src/services/post.service.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// This service largely overlaps with RTK Query's postApiSlice.
// It's recommended to migrate components to use RTK Query hooks (e.g., useGetPostsQuery).

const fetchAllPosts = () => {
  return axios.get(`${API_URL}/posts`);
};

const createNewPost = (postData) => {
  return axios.post(`${API_URL}/posts`, postData, {
    headers: getAuthHeaders(),
  });
};

const getPostById = (postId) => {
  return axios.get(`${API_URL}/posts/${postId}`);
};

const updateExistingPost = (postId, postData) => {
  return axios.put(`${API_URL}/posts/${postId}`, postData, {
    headers: getAuthHeaders(),
  });
};

const deletePostById = (postId) => {
  return axios.delete(`${API_URL}/posts/${postId}`, {
    headers: getAuthHeaders(),
  });
};

const postService = {
  fetchAllPosts,
  createNewPost,
  getPostById,
  updateExistingPost,
  deletePostById,
};

export default postService;
