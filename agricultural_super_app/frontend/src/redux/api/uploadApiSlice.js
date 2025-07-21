// agricultural_super_app/frontend/src/redux/api/uploadApiSlice.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api", // Your Flask backend URL
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken; // Assuming your auth slice stores the token
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (formData) => ({
        // formData should be an instance of FormData
        url: "/upload/image",
        method: "POST",
        body: formData, // No need to set Content-Type header; FormData does it correctly
      }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
