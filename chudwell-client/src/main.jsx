import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

// Apply the saved theme before first paint to avoid a flash.
const saved = localStorage.getItem("Chudwell-theme");
document.documentElement.dataset.theme = saved === "dark" ? "dark" : "light";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
