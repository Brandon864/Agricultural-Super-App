import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice"; // Path based on your screenshot
import { apiSlice } from "./api/apiSlice"; // Import the base apiSlice
import { uploadApi } from "./api/uploadApiSlice"; // Your new uploadApiSlice

// NOTE: We no longer import postApiSlice or marketplaceApiSlice here for their middleware,
// because their endpoints are *injected* into the single 'apiSlice' instance.
// They are still imported in their respective components (e.g., HomePage, PostsListPage)
// to use their specific hooks (e.g., useGetPostsQuery).

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer, // Use the base apiSlice reducer
    [uploadApi.reducerPath]: uploadApi.reducer, // Keep uploadApi if it's a separate API slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware) // ONLY ADD THE BASE API SLICE MIDDLEWARE ONCE
      .concat(uploadApi.middleware), // Keep uploadApi middleware if it's a separate API slice
});

export default store;
