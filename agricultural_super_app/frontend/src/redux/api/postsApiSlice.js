import { apiSlice } from "./apiSlice";

export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/posts",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["Post"],
    }),
    // Mutation for liking a post
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const userId = Number(localStorage.getItem("user_id")); // <-- CHANGE HERE: Convert to Number
        if (!userId) return;

        const patchResult = dispatch(
          postApiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.find((p) => p.id === postId);
            if (post && !post.likes.includes(userId)) {
              post.likes.push(userId);
            }
          })
        );
        const patchResultSingle = dispatch(
          postApiSlice.util.updateQueryData("getPost", postId, (draft) => {
            if (draft && draft.likes && !draft.likes.includes(userId)) {
              draft.likes.push(userId);
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
    // Mutation for unliking a post
    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const userId = Number(localStorage.getItem("user_id")); // <-- CHANGE HERE: Convert to Number
        if (!userId) return;

        const patchResult = dispatch(
          postApiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.find((p) => p.id === postId);
            if (post && post.likes) {
              post.likes = post.likes.filter((id) => id !== userId);
            }
          })
        );
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
    // Comment-related endpoints
    getCommentsByPostId: builder.query({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Comment", id })),
              { type: "Comment", id: "LIST", postId: postId },
            ]
          : [{ type: "Comment", id: "LIST", postId: postId }],
    }),
    // MODIFIED: addComment to accept parent_comment_id
    addComment: builder.mutation({
      query: ({ postId, text, parentCommentId = null }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { text, parent_comment_id: parentCommentId }, // <-- Send as parent_comment_id to backend
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comment", id: "LIST", postId: postId },
      ],
      async onQueryStarted(
        { postId, text, parentCommentId },
        { dispatch, queryFulfilled }
      ) {
        const userId = Number(localStorage.getItem("user_id")); // <-- CHANGE HERE: Convert to Number
        const username = localStorage.getItem("username");

        if (!userId || !username) return;

        const patchResult = dispatch(
          postApiSlice.util.updateQueryData(
            "getCommentsByPostId",
            postId,
            (draft) => {
              const newComment = {
                id: `temp-${Date.now()}`,
                post_id: postId,
                user_id: userId,
                text: text,
                created_at: new Date().toISOString(),
                author_username: username,
                likes: [],
                parent_comment_id: parentCommentId, // <-- ADDED for optimistic update
              };
              // For optimistic updates, simply push. The actual hierarchical rendering will handle placement.
              draft.push(newComment);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // Mutation for liking a comment
    likeComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: "POST",
      }),
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled }
      ) {
        const userId = Number(localStorage.getItem("user_id")); // <-- CHANGE HERE: Convert to Number
        if (!userId) return;

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
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled }
      ) {
        const userId = Number(localStorage.getItem("user_id")); // <-- CHANGE HERE: Convert to Number
        if (!userId) return;

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
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),
  }),
});

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
