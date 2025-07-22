import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UserProfilePage from "./pages/UserProfilePage";
import CommunityPage from "./pages/CommunityPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import PostDetailPage from "./pages/PostDetailPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CreatePostPage from "./pages/CreatePostPage";
import PostsListPage from "./pages/PostsListPage";
import MarketplacePage from "./pages/MarketplacePage";
import CreateMarketplaceItemPage from "./pages/CreateMarketplaceItemPage";
import MarketplaceItemDetailPage from "./pages/MarketplaceItemDetailPage";
import UploadImagePage from "./pages/UploadImagePage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/PrivateRoute";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          {/* AuthProvider has been removed as Redux now handles authentication */}
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/posts" element={<PostsListPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route
                  path="/marketplace/items/:id"
                  element={<MarketplaceItemDetailPage />}
                />
                <Route path="/posts/:id" element={<PostDetailPage />} />

                {/* Protected Routes (requires user to be logged in) */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route
                    path="/communities/create"
                    element={<CreateCommunityPage />}
                  />
                  <Route path="/communities/:id" element={<CommunityPage />} />
                  <Route path="/posts/create" element={<CreatePostPage />} />
                  <Route
                    path="/marketplace/create"
                    element={<CreateMarketplaceItemPage />}
                  />
                  <Route path="/upload-image" element={<UploadImagePage />} />
                </Route>

                {/* Catch-all for undefined routes */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
