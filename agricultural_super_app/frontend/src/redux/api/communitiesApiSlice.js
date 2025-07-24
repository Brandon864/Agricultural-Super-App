// src/redux/api/communitiesApiSlice.js
import { apiSlice } from "./apiSlice"; // Import the base API slice

// Inject endpoints related to communities into the main apiSlice.
export const communitiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get all communities
    getCommunities: builder.query({
      query: () => "/communities",
      providesTags: ["Community"], // Provides data tagged as 'Community'
    }),
    // Query to get a single community by ID
    getCommunity: builder.query({
      query: (id) => `/communities/${id}`,
      // Provides a specific 'Community' tag with an ID for detailed caching.
      providesTags: (result, error, id) => [{ type: "Community", id }],
    }),
    // Mutation to create a new community
    createCommunity: builder.mutation({
      query: (newCommunity) => ({
        url: "/communities",
        method: "POST",
        body: newCommunity,
      }),
      // Invalidates the general 'Community' tag to refetch the list after creation.
      invalidatesTags: ["Community"],
    }),
    // Mutation for a user to join a community
    joinCommunity: builder.mutation({
      // Accepts an object with communityId and userId to send to the backend.
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/join`,
        method: "POST",
        body: { user_id: userId }, // Ensure backend expects `user_id` in the body
      }),
      // Invalidates the specific community's tag to update its member count/status.
      // Also invalidates the 'User' tag because joining a community changes a user's joined communities list.
      invalidatesTags: (result, error, { communityId }) => [
        { type: "Community", id: communityId },
        "User",
      ],
    }),
    // Mutation for a user to leave a community
    leaveCommunity: builder.mutation({
      // Accepts an object with communityId and userId.
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/leave`,
        method: "POST",
        body: { user_id: userId }, // Ensure backend expects `user_id` in the body
      }),
      // Invalidates the specific community's tag and the 'User' tag.
      invalidatesTags: (result, error, { communityId }) => [
        { type: "Community", id: communityId },
        "User",
      ],
    }),
  }),
});

// Export the auto-generated hooks for the injected community endpoints.
export const {
  useGetCommunitiesQuery,
  useGetCommunityQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} = communitiesApiSlice;
