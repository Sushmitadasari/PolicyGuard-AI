import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PublicRoute({ children }) {
  const {
    token,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (token) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default PublicRoute;