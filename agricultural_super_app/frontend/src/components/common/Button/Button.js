// src/components/common/Button/Button.js
import React from "react";
// No specific CSS import here, assuming general button styles are in App.css or index.css

const Button = ({ children, onClick, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className} // Allows passing additional classes for styling
    >
      {children}
    </button>
  );
};

export default Button;
