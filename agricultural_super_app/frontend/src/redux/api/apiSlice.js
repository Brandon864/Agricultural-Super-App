import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



const API_BASE_URL = "https://agricultural-super-app-0725.onrender.com";

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
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    verifyToken: builder.query({
      query: () => "/verify_token",
    }),

    // --- User Endpoints ---
    getUsers: builder.query({
      query: () => "/users",
    }),
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    getProfile: builder.query({
      query: () => "/profile",
      providesTags: (result) => [{ type: "User", id: result?.id }],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, userData) => [
        { type: "User", id: result?.id || userData.id },
      ],
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
        // Safely map over result only if it's an array
        ...(Array.isArray(result)
          ? result.map(({ id }) => ({ type: "User", id }))
          : []),
      ],
    }),
    getFollowing: builder.query({
      query: (userId) => `/users/${userId}/following`,
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
        url: `/users/${userId}/unfollow`,
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
        url: `/communities/${communityId}/unfollow`,
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
