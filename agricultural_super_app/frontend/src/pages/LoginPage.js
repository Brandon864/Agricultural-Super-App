import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoginMutation } from "../redux/auth/authSlice";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth();
  const [loginApi, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // Assuming backend returns { access_token, user_id, username }
      const userData = await loginApi({ username, password }).unwrap();

      // Ensure that authContextLogin expects user and token as separate arguments
      // and maps them correctly to the setCredentials payload.
      // Assuming userData structure is { access_token: "...", user_id: "...", username: "..." }
      // The `user` object passed to `authContextLogin` should match `payload.user` in setCredentials.
      // If backend sends user_id and username separately, construct the user object here:
      const userObject = { id: userData.user_id, username: userData.username };
      authContextLogin(userObject, userData.access_token);

      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setMessage(
        err.data?.message ||
          err.error ||
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
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
