// src/redux/api/uploadApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create a separate API slice specifically for upload functionality.
export const uploadApi = createApi({
  reducerPath: "uploadApi", // Unique reducer path for this slice
  baseQuery: fetchBaseQuery({
    baseUrl: "https://agricultural-super-app-0725.onrender.com", // Your Flask backend URL for uploads
    prepareHeaders: (headers, { getState }) => {
      // Assuming your auth slice stores the token as `accessToken`.
      // Ensure this matches your actual Redux state structure.
      const token = getState().auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // No `tagTypes` are typically needed for simple uploads unless you have a query
  // that lists uploaded files and needs invalidation.
  endpoints: (builder) => ({
    // Mutation for uploading an image.
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/upload/image", // The specific endpoint for image uploads
        method: "POST",
        body: formData, // `formData` should be an instance of FormData
        // RTK Query automatically sets the `Content-Type: multipart/form-data` header
        // when the `body` is a `FormData` object, so you don't need to set it manually.
      }),
    }),
  }),
});

// Export the auto-generated hook for the uploadImage mutation.
export const { useUploadImageMutation } = uploadApi;
