import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../redux/auth/authSlice"; // Corrected import from authSlice

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [registerApi, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await registerApi({ username, email, password }).unwrap();
      setMessage("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setMessage(err.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Register</h2>
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
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="input-field"
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
            {isLoading ? "Registering..." : "Register"}
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
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
