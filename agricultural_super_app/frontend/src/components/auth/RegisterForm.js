// src/components/auth/RegisterForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button/Button"; // Assuming your Button component

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = await register({ username, email, password });
    if (result.success) {
      setSuccess("Registration successful! You can now log in.");
      // Optionally redirect to login page after a short delay
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.error || "Registration failed. Please try again.");
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
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      {success && <p className="success-message">{success}</p>}
      <Button type="submit" className="primary-button">
        Register
      </Button>
      <p style={{ marginTop: "1em", textAlign: "center" }}>
        Already have an account?{" "}
        <a
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer", color: "#007bff" }}
        >
          Login here
        </a>
      </p>
    </form>
  );
}

export default RegisterForm;
