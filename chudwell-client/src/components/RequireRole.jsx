import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Redirects home when the current role isn't allowed on this route.
export default function RequireRole({ allow, children }) {
  const { role } = useAuth();
  return allow.includes(role) ? children : <Navigate to="/" replace />;
}
