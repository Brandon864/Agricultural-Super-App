// src/redux/api/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Post",
    "Comment",
    "MarketplaceItem",
    "Community",
    "Follow",
    "Message",
  ],
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
    // Define logout mutation
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    getUser: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    updateUser: builder.mutation({
      query: (userData) => ({
        url: "/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, userData) => [
        { type: "User", id: result?.id || userData.id },
      ],
    }),
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),

    getUserPosts: builder.query({
      query: (userId) => `/users/${userId}/posts`,
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post", id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
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
      invalidatesTags: (result, error, { community_id, user_id }) => [
        "Post",
        { type: "Community", id: community_id },
        { type: "Post", id: "LIST" },
        { type: "Post", id: `USER_POSTS_${user_id}` },
        { type: "User", id: user_id },
      ],
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
        url: `/posts/${postId}/unlike`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    getCommentsForPost: builder.query({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (result) =>
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

    getUserJoinedCommunities: builder.query({
      query: (userId) => `/users/${userId}/joined_communities`,
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Community", id })),
              { type: "Community", id: "JOINED_LIST" },
            ]
          : [{ type: "Community", id: "JOINED_LIST" }],
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
        { type: "Community", id: "JOINED_LIST" },
        { type: "User", id: result?.current_user_id },
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
        { type: "Community", id: "JOINED_LIST" },
        { type: "User", id: result?.current_user_id },
      ],
    }),
    getCommunityPosts: builder.query({
      query: (communityId) => `/communities/${communityId}/posts`,
      providesTags: (result, error, communityId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post", id })),
              { type: "Community", id: communityId },
            ]
          : [{ type: "Community", id: communityId }],
    }),

    searchUsers: builder.query({
      query: (query) => `/search/users?q=${query}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "User", id })), "UserSearch"]
          : ["UserSearch"],
    }),
    searchCommunities: builder.query({
      query: (query) => `/search/communities?q=${query}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Community", id })),
              "CommunitySearch",
            ]
          : ["CommunitySearch"],
    }),
    searchPosts: builder.query({
      query: (query) => `/search/posts?q=${query}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Post", id })), "PostSearch"]
          : ["PostSearch"],
    }),

    getFollowers: builder.query({
      query: (userId) => `/users/${userId}/followers`,
      providesTags: (result, error, userId) => [
        { type: "Follow", id: `FOLLOWERS_OF_${userId}` },
        ...result.map(({ id }) => ({ type: "User", id })),
      ],
    }),
    getFollowing: builder.query({
      query: (userId) => `/users/${userId}/following`,
      providesTags: (result, error, userId) => [
        { type: "Follow", id: `FOLLOWING_OF_${userId}` },
        ...result.map(({ id }) => ({ type: "User", id })),
      ],
    }),

    followUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: result?.current_user_id },
        { type: "Follow", id: `FOLLOWERS_OF_${userId}` },
        { type: "Follow", id: `FOLLOWING_OF_${result?.current_user_id}` },
      ],
    }),
    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: result?.current_user_id },
        { type: "Follow", id: `FOLLOWERS_OF_${userId}` },
        { type: "Follow", id: `FOLLOWING_OF_${result?.current_user_id}` },
      ],
    }),
    followCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: "Community", id: communityId },
        { type: "Community", id: "JOINED_LIST" },
        { type: "User", id: result?.current_user_id },
      ],
    }),
    unfollowCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/communities/${communityId}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, communityId) => [
        { type: "Community", id: communityId },
        { type: "Community", id: "JOINED_LIST" },
        { type: "User", id: result?.current_user_id },
      ],
    }),

    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "/messages",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: (result, error, arg) => {
        const tags = [{ type: "Message", id: "LIST" }];
        if (arg.receiver_id) {
          tags.push({ type: "Message", id: `DIRECT_${arg.receiver_id}` });
          tags.push({ type: "Message", id: `DIRECT_${result.sender_id}` });
        }
        if (arg.community_id) {
          tags.push({ type: "Message", id: `COMMUNITY_${arg.community_id}` });
        }
        return tags;
      },
    }),
    getDirectMessages: builder.query({
      query: (otherUserId) => `/messages/direct/${otherUserId}`,
      providesTags: (result, error, otherUserId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Message", id })),
              { type: "Message", id: `DIRECT_${otherUserId}` },
            ]
          : [{ type: "Message", id: `DIRECT_${otherUserId}` }],
    }),
    getCommunityMessages: builder.query({
      query: (communityId) => `/messages/community/${communityId}`,
      providesTags: (result, error, communityId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Message", id })),
              { type: "Message", id: `COMMUNITY_${communityId}` },
            ]
          : [{ type: "Message", id: `COMMUNITY_${communityId}` }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation, // Added useLogoutMutation to exports
  useGetUserQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetUserPostsQuery,
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
  useGetUserJoinedCommunitiesQuery,
  useGetCommunitiesQuery,
  useGetCommunityDetailQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useGetCommunityPostsQuery,
  useSearchUsersQuery,
  useSearchCommunitiesQuery,
  useSearchPostsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useFollowCommunityMutation,
  useUnfollowCommunityMutation,
  useSendMessageMutation,
  useGetDirectMessagesQuery,
  useGetCommunityMessagesQuery,
} = apiSlice;
