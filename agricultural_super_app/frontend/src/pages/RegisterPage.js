import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// CORRECTED IMPORT: Changed useRegisterUserMutation to useRegisterMutation
import { useRegisterMutation } from "../redux/api/apiSlice"; // <-- FIX IS HERE
import { setCredentials } from "../redux/auth/authSlice"; // Adjust path if different

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // CORRECTED HOOK: Changed useRegisterUserMutation to useRegisterMutation
  const [registerUser, { isLoading }] = useRegisterMutation(); // <-- FIX IS HERE

  const { currentUser } = useSelector((state) => state.auth);
  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const togglePasswordConfirmVisibility = () => {
    setShowPasswordConfirm((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== passwordConfirm) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await registerUser({
        username,
        email,
        password,
      }).unwrap();

      if (response.access_token && response.user) {
        dispatch(
          setCredentials({ token: response.access_token, user: response.user })
        );
        setMessage("Registration successful!");
        navigate("/dashboard");
      } else {
        setMessage(
          "Registration successful, but login failed. Please try logging in manually."
        );
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setMessage(
        err.data?.message ||
          err.error?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
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
          <div className="form-group password-input-group">
            <label htmlFor="passwordConfirm">Confirm Password:</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                className="input-field"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordConfirmVisibility}
                className="password-toggle-button"
              >
                {showPasswordConfirm ? "Hide" : "Show"}
              </button>
            </div>
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
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
