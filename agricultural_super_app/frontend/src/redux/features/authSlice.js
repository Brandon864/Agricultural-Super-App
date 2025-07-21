// src/redux/features/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  reducers: {
    setAuthTokens: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // You might set user details here if the login response includes them
      // state.user = action.payload.user;
    },
    clearAuthTokens: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    // Optional: if you fetch user details separately after login
    setUserDetails: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setAuthTokens, clearAuthTokens, setUserDetails } =
  authSlice.actions;

export default authSlice.reducer;
