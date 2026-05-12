import {
  Routes,
  Route,
} from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import PDFAnalyzer from "../pages/PDFAnalyzer";
import PDFResultPage from "../pages/PDFResultPage";
import PDFChatPage from "../pages/PDFChatPage";
import WebsiteAnalyzer from "../pages/WebsiteAnalyzer";
import WebsiteResultPage from "../pages/WebsiteResultPage";
import WebsiteChatPage from "../pages/WebsiteChatPage";
import History from "../pages/History";
import Settings from "../pages/Settings";
import ProfileSettings from "../pages/settings/ProfileSettings";
import PasswordSettings from "../pages/settings/PasswordSettings";
import ManageAccount from "../pages/account/ManageAccount";
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
  path="/settings/profile"
  element={<ProfileSettings />}
/>

<Route
  path="/settings/password"
  element={<PasswordSettings />}
/>

<Route
  path="/account/manage"
  element={<ManageAccount />}
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
        path="/pdf-result"
        element={
          <ProtectedRoute>
            <PDFResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pdf-chat"
        element={
          <ProtectedRoute>
            <PDFChatPage />
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
        path="/website-result"
        element={
          <ProtectedRoute>
            <WebsiteResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/website-chat"
        element={
          <ProtectedRoute>
            <WebsiteChatPage />
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