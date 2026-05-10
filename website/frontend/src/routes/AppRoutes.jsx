import {
  Routes,
  Route,
} from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import PDFAnalyzer from "../pages/PDFAnalyzer";
import WebsiteAnalyzer from "../pages/WebsiteAnalyzer";
import History from "../pages/History";
import Settings from "../pages/Settings";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pdf-analyzer"
        element={
          <ProtectedRoute>
            <PDFAnalyzer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/website-analyzer"
        element={
          <ProtectedRoute>
            <WebsiteAnalyzer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;