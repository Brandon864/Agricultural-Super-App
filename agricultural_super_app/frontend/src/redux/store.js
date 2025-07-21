import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import { apiSlice } from "./api/apiSlice";
import { uploadApi } from "./api/uploadApiSlice";

// --- Redux Persist Imports ---
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// Configuration for redux-persist
const persistConfig = {
  key: "root", // The key for the persist storage
  version: 1,
  storage, // Use localStorage
  whitelist: ["auth"], // ONLY the 'auth' slice will be persisted
  // blacklist: ['api', 'uploadApi'] // Optionally blacklist if you don't want these parts persisted
};

// Combine all your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer here
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Exclude redux-persist action types from the serializability check
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(apiSlice.middleware)
      .concat(uploadApi.middleware),
});

// Create a persistor object, which will be used in your App.js
export const persistor = persistStore(store);

// Export store as default if you prefer
export default store;
