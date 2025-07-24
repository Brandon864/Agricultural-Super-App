// src/components/auth/RegisterForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import our AuthContext hook
import Button from "../common/Button/Button"; // Assuming your Button component

function RegisterForm() {
  // State variables for form inputs and messages
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get the register function from AuthContext
  const { register } = useAuth();
  // Hook to programmatically navigate
  const navigate = useNavigate();

  // Handle form submission for registration
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    // Call the register function from AuthContext
    const result = await register({ username, email, password });

    if (result.success) {
      // If registration is successful, show success message and redirect
      setSuccess("Registration successful! You can now log in.");
      // Redirect to login page after a short delay for user to read message
      setTimeout(() => navigate("/login"), 2000);
    } else {
      // If registration fails, set the error message
      setError(result.error || "Registration failed. Please try again.");
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
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      {error && <p className="error-message">{error}</p>} {/* Display error */}
      {success && <p className="success-message">{success}</p>}{" "}
      {/* Display success */}
      <Button type="submit" className="primary-button">
        Register
      </Button>
      <p style={{ marginTop: "1em", textAlign: "center" }}>
        Already have an account?{" "}
        <a
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer", color: "#007bff" }} // Inline style for link, consider using CSS class
        >
          Login here
        </a>
      </p>
    </form>
  );
}

export default RegisterForm;
