// src/redux/api/marketplaceApiSlice.js
import { apiSlice } from "./apiSlice"; // Import the base API slice

// Inject endpoints related to the marketplace into the main apiSlice.
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
      // Provides a specific 'MarketplaceItem' tag with an ID for detailed caching.
      providesTags: (result, error, id) => [{ type: "MarketplaceItem", id }],
    }),
    // Mutation to create a new marketplace item
    createMarketplaceItem: builder.mutation({
      query: (itemData) => ({
        url: "/marketplace/items", // Backend POST endpoint for creating items
        method: "POST",
        body: itemData, // The data for the new item
      }),
      // Invalidate 'MarketplaceItem' tag to refetch the list after creation,
      // ensuring the UI reflects the new item.
      invalidatesTags: ["MarketplaceItem"],
    }),
    // You can add `updateMarketplaceItem` and `deleteMarketplaceItem` mutations here later
    // as your application evolves.
  }),
});

// Export the auto-generated hooks for the injected marketplace endpoints.
export const {
  useGetMarketplaceItemsQuery,
  useGetMarketplaceItemQuery,
  useCreateMarketplaceItemMutation,
} = marketplaceApiSlice;
