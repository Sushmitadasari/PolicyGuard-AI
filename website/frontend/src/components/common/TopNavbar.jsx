import React, { useEffect } from "react";
import AIStatusBadge from "./AIStatusBadge";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../../context/AuthContext";

function TopNavbar() {
  const { user, logout } = useAuth();

  useEffect(() => {
    // expose the topbar height to CSS so modals can position below it responsively
    try {
      document.documentElement.style.setProperty("--topbar-height", "6rem");
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="sticky top-0 z-40 h-24 bg-black/30 border-b border-white/10 backdrop-blur-3xl px-8 flex items-center justify-between">
      <div className="ml-auto flex items-center gap-6">
        <AIStatusBadge status="Active" />

        <ProfileDropdown user={user} onLogout={logout} />
      </div>
    </div>
  );
}

export default TopNavbar;