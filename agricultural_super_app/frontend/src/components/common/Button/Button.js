// src/components/common/Button/Button.js
import React from "react";
// No specific CSS import here, assuming general button styles are in App.css

const Button = ({ children, onClick, type = "button", className = "" }) => {
  return (
    // Render a button element with dynamic type, onClick handler, and class names
    <button
      type={type}
      onClick={onClick}
      // Combine base "button" class with any additional classes passed via props
      className={`button ${className}`}
    >
      {children} {/* Render content passed as children (e.g., button text) */}
    </button>
  );
};

export default Button;
