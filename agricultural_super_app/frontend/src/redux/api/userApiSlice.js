// src/redux/api/userApiSlice.js
import { apiSlice } from "./apiSlice"; // Import the base API slice

// Inject endpoints related to user-specific actions into the main apiSlice.
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation to update only the user's profile picture URL.
    updateUserProfilePicture: builder.mutation({
      query: ({ profilePictureUrl }) => ({
        url: "/user/profile_picture", // Backend endpoint for updating profile picture
        method: "PUT",
        body: { profile_picture_url: profilePictureUrl }, // Send the URL in the request body
      }),
      // Invalidates the 'User' tag to trigger a refetch of any `getUser` queries,
      // ensuring the UI displays the new profile picture.
      invalidatesTags: ["User"],
    }),
  }),
});

// Export the auto-generated hook for the updateUserProfilePicture mutation.
export const { useUpdateUserProfilePictureMutation } = userApiSlice;
