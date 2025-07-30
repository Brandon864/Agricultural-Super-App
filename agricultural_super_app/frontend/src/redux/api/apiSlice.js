import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your API base URL.
// For local development: "http://localhost:5000" (if using .env for /api prefix)
// For Render deployment: Your deployed backend URL (e.g., "https://your-app-name.onrender.com")
const API_BASE_URL = "https://agricultural-super-app-0725.onrender.com"; // This is correct for the base domain

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from localStorage using the correct key "token"
      const token = localStorage.getItem("token");
      // If a token is found, set the Authorization header
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
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
    // --- Authentication Endpoints ---
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/login", // Added /api
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/api/register", // Added /api
        method: "POST",
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/api/logout", // Added /api
        method: "POST",
      }),
    }),
    verifyToken: builder.query({
      query: () => "/api/verify_token", // Added /api
    }),

    // --- User Endpoints ---
    getUsers: builder.query({
      query: () => "/api/users", // Added /api
    }),
    getUserById: builder.query({
      query: (userId) => `/api/users/${userId}`, // Added /api
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    getProfile: builder.query({
      query: () => "/api/profile", // Added /api
      providesTags: (result) => [{ type: "User", id: result?.id }],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/api/profile", // Added /api
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, userData) => [
        { type: "User", id: result?.id || userData.id },
      ],
    }),
    getUserPosts: builder.query({
      query: (userId) => `/api/users/${userId}/posts`, // Added /api
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post", id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    getPosts: builder.query({
      query: () => "/api/posts", // Added /api
      providesTags: ["Post"],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/api/posts", // Added /api
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
      query: (postId) => `/api/posts/${postId}`, // Added /api
      providesTags: (result, error, postId) => [{ type: "Post", id: postId }],
    }),
    likePost: builder.mutation({
      query: ({ postId }) => ({
        url: `/api/posts/${postId}/like`, // Added /api
        method: "POST",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),
    unlikePost: builder.mutation({
      query: ({ postId }) => ({
        url: `/api/posts/${postId}/unlike`, // Added /api
        method: "POST",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    getCommentsForPost: builder.query({
      query: (postId) => `/api/posts/${postId}/comments`, // Added /api
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
        url: `/api/posts/${postId}/comments`, // Added /api
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
        url: `/api/comments/${commentId}/like`, // Added /api
        method: "POST",
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),
    unlikeComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/api/comments/${commentId}/like`, // Added /api
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),

    getMarketplaceItems: builder.query({
      query: () => "/api/marketplace/items", // Added /api
      providesTags: ["MarketplaceItem"],
    }),
    createMarketplaceItem: builder.mutation({
      query: (itemData) => ({
        url: "/api/marketplace/items", // Added /api
        method: "POST",
        body: itemData,
      }),
      invalidatesTags: ["MarketplaceItem"],
    }),
    getMarketplaceItemDetail: builder.query({
      query: (itemId) => `/api/marketplace/items/${itemId}`, // Added /api
      providesTags: (result, error, itemId) => [
        { type: "MarketplaceItem", id: itemId },
      ],
    }),

    getUserJoinedCommunities: builder.query({
      query: (userId) => `/api/users/${userId}/joined_communities`, // Added /api
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Community", id })),
              { type: "Community", id: "JOINED_LIST" },
            ]
          : [{ type: "Community", id: "JOINED_LIST" }],
    }),

    getCommunities: builder.query({
      query: () => "/api/communities", // Added /api
      providesTags: ["Community"],
    }),
    getCommunityDetail: builder.query({
      query: (communityId) => `/api/communities/${communityId}`, // Added /api
      providesTags: (result, error, communityId) => [
        { type: "Community", id: communityId },
      ],
    }),
    createCommunity: builder.mutation({
      query: (communityData) => ({
        url: "/api/communities", // Added /api
        method: "POST",
        body: communityData,
      }),
      invalidatesTags: ["Community"],
    }),
    joinCommunity: builder.mutation({
      query: (communityId) => ({
        url: `/api/communities/${communityId}/join`, // Added /api
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
        url: `/api/communities/${communityId}/leave`, // Added /api
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
      query: (communityId) => `/api/communities/${communityId}/posts`, // Added /api
      providesTags: (result, error, communityId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post", id })),
              { type: "Community", id: communityId },
            ]
          : [{ type: "Community", id: communityId }],
    }),

    searchUsers: builder.query({
      query: (query) => `/api/search/users?q=${query}`, // Added /api
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "User", id })), "UserSearch"]
          : ["UserSearch"],
    }),
    searchCommunities: builder.query({
      query: (query) => `/api/search/communities?q=${query}`, // Added /api
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Community", id })),
              "CommunitySearch",
            ]
          : ["CommunitySearch"],
    }),
    searchPosts: builder.query({
      query: (query) => `/api/search/posts?q=${query}`, // Added /api
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Post", id })), "PostSearch"]
          : ["PostSearch"],
    }),

    getFollowers: builder.query({
      query: (userId) => `/api/users/${userId}/followers`, // Added /api
      providesTags: (result, error, userId) => [
        { type: "Follow", id: `FOLLOWERS_OF_${userId}` },
        // Safely map over result only if it's an array
        ...(Array.isArray(result)
          ? result.map(({ id }) => ({ type: "User", id }))
          : []),
      ],
    }),
    getFollowing: builder.query({
      query: (userId) => `/api/users/${userId}/following`, // Added /api
      providesTags: (result, error, userId) => [
        { type: "Follow", id: `FOLLOWING_OF_${userId}` },
        // Safely map over result only if it's an array
        ...(Array.isArray(result)
          ? result.map(({ id }) => ({ type: "User", id }))
          : []),
      ],
    }),

    followUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}/follow`, // Added /api
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
        url: `/api/users/${userId}/unfollow`, // Added /api
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
        url: `/api/communities/${communityId}/follow`, // Added /api
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
        url: `/api/communities/${communityId}/unfollow`, // Added /api
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
        url: "/api/messages", // Added /api
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
      query: (otherUserId) => `/api/messages/direct/${otherUserId}`, // Added /api
      providesTags: (result, error, otherUserId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Message", id })),
              { type: "Message", id: `DIRECT_${otherUserId}` },
            ]
          : [{ type: "Message", id: `DIRECT_${otherUserId}` }],
    }),
    getCommunityMessages: builder.query({
      query: (communityId) => `/api/messages/community/${communityId}`, // Added /api
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
  useLogoutMutation,
  useVerifyTokenQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUserPostsQuery,
  useGetPostsQuery,
  useCreatePostMutation,
  useGetPostDetailQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsForPostQuery,
  useGetRepliesForCommentQuery,
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
  useSendMessageMutation,
  useGetDirectMessagesQuery,
  useGetCommunityMessagesQuery,
  useSearchUsersQuery,
  useSearchCommunitiesQuery,
  useSearchPostsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useFollowCommunityMutation,
  useUnfollowCommunityMutation,
} = apiSlice;
