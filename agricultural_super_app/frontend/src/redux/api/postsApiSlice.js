// src/redux/api/postApiSlice.js
import { apiSlice } from "./apiSlice"; // Import the base API slice

// Inject endpoints related to posts and comments into the main apiSlice.
export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get all posts
    getPosts: builder.query({
      query: () => "/posts",
      providesTags: ["Post"], // Provides data tagged as 'Post' (for the list)
    }),
    // Query to get a single post by ID
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      // Provides a specific 'Post' tag with an ID for detailed caching.
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    // Mutation to create a new post
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/posts",
        method: "POST",
        body: postData,
      }),
      // Invalidates the general 'Post' tag to refetch the list of posts.
      invalidatesTags: ["Post"],
    }),
    // Mutation for liking a post
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
      // `onQueryStarted` allows for optimistic updates.
      // The UI is updated immediately, and if the API call fails, the change is reverted.
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        // Retrieve userId from localStorage and convert it to a Number.
        const userId = Number(localStorage.getItem("user_id"));
        if (!userId) return; // Exit if userId is not found

        // Optimistically update the 'getPosts' query's cache (list of all posts).
        const patchResult = dispatch(
          postApiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.find((p) => p.id === postId);
            // If post exists and user hasn't liked it yet, add userId to likes array.
            if (post && !post.likes.includes(userId)) {
              post.likes.push(userId);
            }
          })
        );
        // Optimistically update the 'getPost' query's cache (single post detail).
        const patchResultSingle = dispatch(
          postApiSlice.util.updateQueryData("getPost", postId, (draft) => {
            if (draft && draft.likes && !draft.likes.includes(userId)) {
              draft.likes.push(userId);
            }
          })
        );
        try {
          await queryFulfilled; // Wait for the actual API call to complete
        } catch {
          patchResult.undo(); // If API call fails, revert the optimistic update
          patchResultSingle.undo();
        }
      },
      // Invalidates the specific post's tag to ensure consistency with the server's state
      // after the optimistic update and potential undo.
      invalidatesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    // Mutation for unliking a post
    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "DELETE",
      }),
      // `onQueryStarted` for optimistic update on unliking a post.
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const userId = Number(localStorage.getItem("user_id"));
        if (!userId) return;

        // Optimistically update the 'getPosts' query's cache.
        const patchResult = dispatch(
          postApiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.find((p) => p.id === postId);
            if (post && post.likes) {
              // Filter out the userId to simulate unliking.
              post.likes = post.likes.filter((id) => id !== userId);
            }
          })
        );
        // Optimistically update the 'getPost' query's cache.
        const patchResultSingle = dispatch(
          postApiSlice.util.updateQueryData("getPost", postId, (draft) => {
            if (draft && draft.likes) {
              draft.likes = draft.likes.filter((id) => id !== userId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          patchResultSingle.undo();
        }
      },
      invalidatesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    // --- Comment-related Endpoints ---
    getCommentsByPostId: builder.query({
      query: (postId) => `/posts/${postId}/comments`,
      // Provides tags for individual comments and a "LIST" tag specific to the post's comments.
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Comment", id })),
              { type: "Comment", id: "LIST", postId: postId }, // Specific list tag for this post's comments
            ]
          : [{ type: "Comment", id: "LIST", postId: postId }], // Fallback for initial load
    }),
    // MODIFIED: `addComment` now accepts `parentCommentId` for threaded comments.
    addComment: builder.mutation({
      query: ({ postId, text, parentCommentId = null }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { text, parent_comment_id: parentCommentId }, // Send `parent_comment_id` to backend
      }),
      // Invalidates the specific comment list for the post.
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comment", id: "LIST", postId: postId },
      ],
      // Optimistic update for adding a comment.
      async onQueryStarted(
        { postId, text, parentCommentId },
        { dispatch, queryFulfilled }
      ) {
        // Retrieve userId and username from localStorage and convert userId to Number.
        const userId = Number(localStorage.getItem("user_id"));
        const username = localStorage.getItem("username");

        if (!userId || !username) return;

        // Optimistically update the 'getCommentsByPostId' query's cache.
        const patchResult = dispatch(
          postApiSlice.util.updateQueryData(
            "getCommentsByPostId",
            postId,
            (draft) => {
              // Create a temporary comment object for immediate UI display.
              const newComment = {
                id: `temp-${Date.now()}`, // Temporary ID for optimistic update
                post_id: postId,
                user_id: userId,
                text: text,
                created_at: new Date().toISOString(),
                author_username: username,
                likes: [],
                parent_comment_id: parentCommentId, // Include parent ID for optimistic rendering
              };
              draft.push(newComment); // Add the new comment to the draft state
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Revert if API call fails
        }
      },
    }),
    // Mutation for liking a comment
    likeComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: "POST",
      }),
      // Optimistic update for liking a comment.
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled }
      ) {
        const userId = Number(localStorage.getItem("user_id"));
        if (!userId) return;

        // Update the specific comments list for the given post.
        const patchResult = dispatch(
          postApiSlice.util.updateQueryData(
            "getCommentsByPostId",
            postId,
            (draft) => {
              const comment = draft.find((c) => c.id === commentId);
              if (comment && !comment.likes.includes(userId)) {
                comment.likes.push(userId);
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      // Invalidates the specific comment's tag after the API call.
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),
    // Mutation for unliking a comment
    unlikeComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: "DELETE",
      }),
      // Optimistic update for unliking a comment.
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled }
      ) {
        const userId = Number(localStorage.getItem("user_id"));
        if (!userId) return;

        // Update the specific comments list for the given post.
        const patchResult = dispatch(
          postApiSlice.util.updateQueryData(
            "getCommentsByPostId",
            postId,
            (draft) => {
              const comment = draft.find((c) => c.id === commentId);
              if (comment && comment.likes) {
                comment.likes = comment.likes.filter((id) => id !== userId);
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      // Invalidates the specific comment's tag after the API call.
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),
  }),
});

// Export the auto-generated hooks for the injected post and comment endpoints.
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsByPostIdQuery,
  useAddCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = postApiSlice;
