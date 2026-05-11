import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { label: "My Profile", path: "/profile", description: "Account and identity" },
  { label: "Workspace", path: "/dashboard", description: "Dashboard overview" },
  { label: "AI Preferences", path: "/settings", description: "Model and assistant settings" },
  { label: "Privacy & Security", path: "/settings", description: "Security controls" },
  { label: "Notifications", path: "/settings", description: "Alerts and updates" },
  { label: "Scan History", path: "/history", description: "Recent analyses" },
  { label: "Help Center", path: "/settings", description: "Support and guidance" },
];

const getDisplayName = (user) => {
  if (!user || typeof user !== "object") {
    return "User";
  }

  return user.name || user.fullName || user.username || user.email || "User";
};

const getInitial = (user) => {
  const name = getDisplayName(user).trim();
  return name ? name.charAt(0).toUpperCase() : "U";
};

const getRoleLabel = (user) => {
  const rawRole = user?.role || user?.accountRole || user?.plan || user?.tier || user?.accessLevel;

  if (!rawRole) {
    return "User";
  }

  const normalized = String(rawRole).trim().toLowerCase();
  if (normalized === "free" || normalized === "free user") return "Free User";
  if (normalized === "pro" || normalized === "pro analyst" || normalized === "analyst") return "Pro Analyst";
  if (normalized === "enterprise" || normalized === "enterprise user") return "Enterprise User";
  if (normalized === "admin") return "Admin";

  return String(rawRole).trim();
};

const getAccountStatus = (user) => {
  const rawStatus = user?.accountStatus || user?.status || user?.securityStatus;

  if (!rawStatus) {
    return "Protected";
  }

  const normalized = String(rawStatus).trim().toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "protected") return "Protected";
  if (normalized === "secured" || normalized === "secure") return "Enterprise Secured";

  return String(rawStatus).trim();
};

import ProfileModal from "./ProfileModal";

function ProfileDropdown({ user, onLogout }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const roleLabel = useMemo(() => getRoleLabel(user), [user]);
  const initial = useMemo(() => getInitial(user), [user]);
  const email = user?.email || "";
  const accountStatus = useMemo(() => getAccountStatus(user), [user]);
  const isAiActive = Boolean(user);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleItemClick = (path) => {
    setOpen(false);
    // open profile modal for the My Profile path
    if (path === "/profile") {
      setShowProfile(true);
      return;
    }

    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  const [showProfile, setShowProfile] = useState(false);

  return (
    <div ref={rootRef} className="relative ml-auto">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
            menuRef.current?.querySelector("button, a")?.focus?.();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-left transition-all hover:border-cyan-400/30 hover:bg-white/6 hover:shadow-[0_0_0_1px_rgba(6,182,212,0.08)]"
      >
        <div className="flex items-center gap-4">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-white font-semibold leading-none">{displayName}</p>
            <div className="mt-1 flex items-center justify-end gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 font-black text-xl text-white shadow-lg shadow-cyan-500/20">
            {initial}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <div ref={menuRef} className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))]">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="menu"
              aria-label="Profile menu"
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#07111f]/95 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl"
            >
              <div className="border-b border-white/10 bg-white/3 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 font-black text-2xl text-white shadow-lg shadow-cyan-500/20 sm:h-16 sm:w-16">
                    {initial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white sm:text-lg">{displayName}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                        {roleLabel}
                      </span>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                        {accountStatus}
                      </span>
                    </div>

                    {email && <p className="mt-3 truncate text-sm text-cyan-100/80">{email}</p>}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        {isAiActive ? "AI Active" : "AI Offline"}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        Protected
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        Enterprise Secured
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => handleItemClick(item.path)}
                    className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-white/6 hover:shadow-[0_0_0_1px_rgba(6,182,212,0.08)] focus:bg-white/8 focus:outline-none"
                  >
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400/80 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-transform group-hover:scale-110" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-white/45">{item.description}</p>
                    </div>
                  </button>
                ))}

                <div className="my-2 border-t border-white/10" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-red-500/10 focus:bg-red-500/10 focus:outline-none"
                >
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.4)]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-300">Logout</p>
                    <p className="mt-1 text-xs text-white/45">Sign out securely</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}

export default ProfileDropdown;