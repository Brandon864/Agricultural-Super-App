import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateUserProfilePicture: builder.mutation({
      query: ({ profilePictureUrl }) => ({
        url: "/user/profile_picture",
        method: "PUT",
        body: { profile_picture_url: profilePictureUrl },
      }),
      invalidatesTags: ["User"], // Invalidate User tag to refetch user data after update
    }),
  }),
});

export const { useUpdateUserProfilePictureMutation } = userApiSlice;
