import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // If we have a saved user, restore it.
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn("Failed to parse saved user", e);
        setUser(null);
      }
      setInitializing(false);
      return;
    }

    // If token exists but no saved user, try to decode token payload
    if (token && !savedUser) {
      try {
        const parts = token.split(".");
        if (parts.length >= 2) {
          const payload = parts[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
          // minimal user object (email, sub, name) depending on token
          const inferredUser = {
            id: decoded.sub || decoded.userId || null,
            email: decoded.email || decoded.sub || null,
            name: decoded.name || decoded.username || null,
          };
          setUser(inferredUser);
          localStorage.setItem("user", JSON.stringify(inferredUser));
        }
      } catch (e) {
        console.warn("Failed to decode token", e);
        setUser(null);
      }
    }

    setInitializing(false);
  }, []);

  const login = (
    token,
    userData
  ) => {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(
        userData
      )
    );

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
    // Redirect to login page
    try {
      window.location.href = "/login";
    } catch (e) {
      console.warn("Failed to redirect on logout", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);