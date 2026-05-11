import {
  BrowserRouter,
} from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

import {
  AuthProvider,
} from "./context/AuthContext";

import { AnalyticsProvider } from "./context/AnalyticsContext";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <AnalyticsProvider>

          <AppRoutes />

        </AnalyticsProvider>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;