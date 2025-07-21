import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice"; // Import apiSlice to extend it

const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState = {
  token: token || null,
  currentUser: user ? JSON.parse(user) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      // Expects payload = { token: '...', user: { id: '...', username: '...' } }
      state.token = payload.token;
      state.currentUser = payload.user;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.currentUser = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

// Extend the apiSlice with auth-related endpoints
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getUser: builder.query({
      query: () => "/profile", // Changed from "/user" to "/profile" based on Flask app.py
      providesTags: ["User"], // Tag for caching, used by AuthContext
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUserQuery, // Export the query hook for AuthContext
} = authApiSlice;

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
