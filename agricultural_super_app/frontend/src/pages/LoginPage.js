import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation, apiSlice } from "../redux/api/apiSlice";
import { setCredentials } from "../redux/auth/authSlice";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginApi, { isLoading }] = useLoginMutation();

  const { currentUser } = useSelector((state) => state.auth);

  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const loginResponse = await loginApi({ username, password }).unwrap();

      let userToStore = null;

      // Handle the case where the backend returns 'user_id' and 'username' directly
      if (loginResponse.user_id && loginResponse.username) {
        userToStore = {
          id: loginResponse.user_id,
          username: loginResponse.username,
          // Email is missing here, we'll try to fetch it below with getUser
        };
      }
      // If the backend happens to return a 'user' object (e.g., if you modify the backend later)
      else if (loginResponse.user) {
        userToStore = loginResponse.user;
      }

      // If userToStore is still null, or if we need more user details (like email),
      // we initiate the getUser query.
      if (!userToStore || !userToStore.email) {
        // Check for email specifically if it's important for initial load
        console.log(
          "Login response did not contain full user data. Attempting to fetch profile..."
        );
        try {
          // Dispatch the getUser endpoint from apiSlice
          const { data: fetchedUserData } = await dispatch(
            apiSlice.endpoints.getUser.initiate(
              null, // No args needed for getUser
              { forceRefetch: true } // Force refetch to ensure we get the latest data
            )
          ).unwrap();
          userToStore = fetchedUserData; // This should now contain id, username, and email
          console.log(
            "Successfully fetched full user data after login:",
            userToStore
          );
        } catch (fetchErr) {
          console.error("Failed to fetch user data after login:", fetchErr);
          setMessage(
            "Login successful, but failed to load complete user profile. Please try refreshing."
          );
          // Fallback: If fetching fails, use whatever user data we managed to get, or default to null
          userToStore = userToStore || {
            id: loginResponse.user_id,
            username: loginResponse.username,
            email: null,
          };
        }
      }

      // Dispatch credentials only if we have at least a token and some user data
      if (loginResponse.access_token && userToStore) {
        dispatch(
          setCredentials({
            token: loginResponse.access_token,
            user: userToStore,
          })
        );
        setMessage("Login successful!");
        navigate("/dashboard");
      } else {
        setMessage("Login process incomplete. Missing token or user data.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setMessage(
        err.data?.message ||
          err.error?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group password-input-group">
            <label htmlFor="password">Password:</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="button primary-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging In..." : "Login"}
          </button>
          {message && (
            <p
              className={`message ${
                message.includes("successful") ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
