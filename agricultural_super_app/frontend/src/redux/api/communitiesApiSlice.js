import { apiSlice } from "./apiSlice";

export const communitiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query({
      query: () => "/communities",
      providesTags: ["Community"],
    }),
    getCommunity: builder.query({
      query: (id) => `/communities/${id}`,
      providesTags: (result, error, id) => [{ type: "Community", id }],
    }),
    createCommunity: builder.mutation({
      query: (newCommunity) => ({
        url: "/communities",
        method: "POST",
        body: newCommunity,
      }),
      invalidatesTags: ["Community"],
    }),
    joinCommunity: builder.mutation({
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/join`,
        method: "POST",
        body: { user_id: userId },
      }),
      invalidatesTags: (result, error, { communityId }) => [
        { type: "Community", id: communityId },
        "User",
      ],
    }),
    leaveCommunity: builder.mutation({
      query: ({ communityId, userId }) => ({
        url: `/communities/${communityId}/leave`,
        method: "POST",
        body: { user_id: userId },
      }),
      invalidatesTags: (result, error, { communityId }) => [
        { type: "Community", id: communityId },
        "User",
      ],
    }),
  }),
});

export const {
  useGetCommunitiesQuery,
  useGetCommunityQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} = communitiesApiSlice;
