import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole.toLowerCase()) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}
