import { apiSlice } from "./apiSlice"; // Make sure this path is correct for your base API slice

export const marketplaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query to get all marketplace items
    getMarketplaceItems: builder.query({
      query: () => "/marketplace/items", // API endpoint for getting all items
      providesTags: ["MarketplaceItem"], // Tag for cache invalidation
    }),
    // Query to get a single marketplace item by ID
    getMarketplaceItem: builder.query({
      query: (id) => `/marketplace/items/${id}`, // API endpoint for getting a single item
      providesTags: (result, error, id) => [{ type: "MarketplaceItem", id }], // Tag for cache invalidation
    }),
    // Mutation to create a new marketplace item
    createMarketplaceItem: builder.mutation({
      query: (itemData) => ({
        url: "/marketplace/items", // Backend POST endpoint for creating items
        method: "POST",
        body: itemData, // The data for the new item
      }),
      invalidatesTags: ["MarketplaceItem"], // Invalidate 'MarketplaceItem' tag to refetch the list after creation
    }),
    // You can add updateMarketplaceItem and deleteMarketplaceItem mutations here later
  }),
});

// Export the auto-generated hooks
export const {
  useGetMarketplaceItemsQuery,
  useGetMarketplaceItemQuery,
  useCreateMarketplaceItemMutation,
} = marketplaceApiSlice;
