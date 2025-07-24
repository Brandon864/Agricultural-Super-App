// src/redux/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");
const userString = localStorage.getItem("user");

const currentUser =
  userString && userString !== "undefined" && userString !== "null"
    ? JSON.parse(userString)
    : null;

const initialState = {
  token: token || null,
  currentUser: currentUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
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

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
