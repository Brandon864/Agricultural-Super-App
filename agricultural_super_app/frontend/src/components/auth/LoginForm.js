// src/components/auth/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button/Button"; // Assuming your Button component

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login({ username, password });
    if (result.success) {
      navigate("/"); // Redirect to home or dashboard on successful login
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <Button type="submit" className="primary-button">
        Login
      </Button>
      <p style={{ marginTop: "1em", textAlign: "center" }}>
        Don't have an account?{" "}
        <a
          onClick={() => navigate("/register")}
          style={{ cursor: "pointer", color: "#007bff" }}
        >
          Register here
        </a>
      </p>
    </form>
  );
}

export default LoginForm;
