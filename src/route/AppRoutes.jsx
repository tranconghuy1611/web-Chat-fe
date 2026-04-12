import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Chat from "../pages/Chat";
import { Navigate } from "react-router-dom";

const AppRoutes = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<Login />} />


      {/* Private */}
      <Route
        path="/chat"
        element={<Chat />}
      />

    </Routes>
  );
};

export default AppRoutes;