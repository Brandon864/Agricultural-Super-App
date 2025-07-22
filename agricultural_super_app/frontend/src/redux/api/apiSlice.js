import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token; // Assuming your token is stored here
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Post", "Comment", "MarketplaceItem", "Community"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),
    getUser: builder.query({
      query: () => "/profile",
      providesTags: ["User"], // Correct: provides 'User' tag
    }),
    updateUser: builder.mutation({
      query: (userData) => ({
        url: "/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"], // Correct: invalidates 'User' tag, triggering refetch of getUser
    }),

    getPosts: builder.query({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/posts",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["Post"],
    }),
    getPostDetail: builder.query({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: "Post", id: postId }],
    }),
    likePost: builder.mutation({
      query: ({ postId }) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),
    unlikePost: builder.mutation({
      query: ({ postId }) => ({
        url: `/posts/${postId}/like`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    getCommentsForPost: builder.query({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Comment", id })),
              { type: "Comment", id: "LIST" },
            ]
          : ["Comment"],
    }),
    addCommentToPost: builder.mutation({
      query: ({ postId, commentData }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comment", id: "LIST" },
        { type: "Post", id: postId },
      ],
    }),
    likeComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),
    unlikeComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),

    getMarketplaceItems: builder.query({
      query: () => "/marketplace/items",
      providesTags: ["MarketplaceItem"],
    }),
    createMarketplaceItem: builder.mutation({
      query: (itemData) => ({
        url: "/marketplace/items",
        method: "POST",
        body: itemData,
      }),
      invalidatesTags: ["MarketplaceItem"],
    }),
    getMarketplaceItemDetail: builder.query({
      query: (itemId) => `/marketplace/items/${itemId}`,
      providesTags: (result, error, itemId) => [
        { type: "MarketplaceItem", id: itemId },
      ],
    }),

    getCommunities: builder.query({
      query: () => "/communities",
      providesTags: ["Community"],
    }),
    getCommunityDetail: builder.query({
      query: (communityId) => `/communities/${communityId}`,
      providesTags: (result, error, communityId) => [
        { type: "Community", id: communityId },
      ],
    }),
    createCommunity: builder.mutation({
      query: (communityData) => ({
        url: "/communities",
        method: "POST",
        body: communityData,
      }),
      invalidatesTags: ["Community"],
    }),
    joinCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/join`,
        method: "POST",
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: "Community", id: communityId },
        "Community",
      ],
    }),
    leaveCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/leave`,
        method: "POST",
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: "Community", id: communityId },
        "Community",
      ],
    }),
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/upload/image", // Corrected URL to match Flask backend '/api/upload/image'
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useGetPostsQuery,
  useCreatePostMutation,
  useGetPostDetailQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsForPostQuery,
  useAddCommentToPostMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useGetMarketplaceItemsQuery,
  useCreateMarketplaceItemMutation,
  useGetMarketplaceItemDetailQuery,
  useGetCommunitiesQuery,
  useGetCommunityDetailQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useUploadImageMutation,
} = apiSlice;
