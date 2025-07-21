import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api", // This is the reducer path for the base API
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api", // Your Flask backend URL
    prepareHeaders: (headers, { getState }) => {
      // Retrieve the token from the Redux auth slice state
      // Based on your authSlice.js, the token is stored as 'token'
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Define all common tag types used across ALL your injected slices here.
  // This helps with cache invalidation across different parts of your app.
  tagTypes: ["Post", "Comment", "MarketplaceItem", "User"],
  endpoints: (builder) => ({
    // This base apiSlice typically has no endpoints of its own.
    // Specific endpoints (like posts, marketplace, auth) are injected into it
    // from other dedicated slice files (e.g., postsApiSlice.js, authSlice.js).
  }),
});
