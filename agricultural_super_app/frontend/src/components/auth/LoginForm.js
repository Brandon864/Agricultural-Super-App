// src/components/auth/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import our AuthContext hook
import Button from "../common/Button/Button"; // Assuming your Button component

function LoginForm() {
  // State variables for username, password, and error messages
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Get the login function from our AuthContext
  const { login } = useAuth();
  // Hook to programmatically navigate between routes
  const navigate = useNavigate();

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(""); // Clear any previous errors

    // Call the login function from AuthContext with user credentials
    const result = await login({ username, password });

    if (result.success) {
      // If login is successful, navigate to the home page or dashboard
      navigate("/");
    } else {
      // If login fails, set the error message received from the AuthContext
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {" "}
      {/* Added auth-form class */}
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="input-field" // Added input-field class
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field" // Added input-field class
        />
      </div>
      {error && <p className="error-message">{error}</p>}{" "}
      {/* Display error message */}
      <Button type="submit" className="primary-button">
        Login
      </Button>
      <p style={{ marginTop: "1em", textAlign: "center" }}>
        Don't have an account?{" "}
        <a
          onClick={() => navigate("/register")}
          style={{ cursor: "pointer", color: "#007bff" }} // Inline style for link, consider using CSS class
        >
          Register here
        </a>
      </p>
    </form>
  );
}

export default LoginForm;
