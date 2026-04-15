import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Chat from "../pages/Chat";
import AdminManagement from "../pages/AdminManagement";
import NotAuthorized from "../pages/NotAuthorized";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;