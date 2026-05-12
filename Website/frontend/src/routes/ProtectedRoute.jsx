import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

function ProtectedRoute({
  children,
}) {
  const { user } =
    useAuth();
  const { initializing } = useAuth();

  // While auth is initializing, don't redirect — prevents flicker on refresh
  if (initializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;