import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css"; // Make sure App.css is imported for global styles
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
