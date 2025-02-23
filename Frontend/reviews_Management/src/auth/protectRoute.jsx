import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("auth"); // Check if token exists

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
