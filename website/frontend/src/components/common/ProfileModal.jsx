import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const joinedDate = useMemo(() => {
    const d = user?.joinedAt || user?.createdAt || user?.created || null;
    if (!d) return null;
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString();
    } catch (e) {
      return String(d).split("T")[0];
    }
  }, [user]);

  const org = user?.organization || user?.org || user?.workspace || "—";
  const phone = user?.phone || "";

  const handleEdit = () => navigate("/settings/profile");
  const handlePassword = () => navigate("/settings/password");
  const handleManage = () => navigate("/account/manage");
  const handleLogout = () => {
    try {
      logout?.();
    } catch (e) {
      console.warn("Logout failed", e);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
        >
          <div
            className="z-[9990] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "var(--topbar-height, 6rem)",
              bottom: 0,
            }}
          />

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "calc(var(--topbar-height, 6rem) + 0.75rem)",
              left: "1rem",
              right: "1rem",
              maxHeight: "calc(100vh - var(--topbar-height, 6rem) - 2rem)",
              width: "auto",
              maxWidth: "42rem",
              marginLeft: "auto",
              marginRight: "auto",
              overflowY: "auto",
            }}
            className="z-[10000] rounded-2xl border border-white/10 bg-[#07111f]/95 p-3 shadow-2xl sm:p-6"
          >
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-6">
              <div className="w-full lg:w-56 flex-shrink-0">
                <div className="flex h-full flex-col items-center gap-3 lg:gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-2xl font-extrabold text-white shadow-md lg:h-24 lg:w-24 lg:text-3xl">
                    {user ? (user.name || user.email || user.id || "U").charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="w-full text-center">
                    <div className="truncate text-sm font-semibold text-white sm:text-base">{user?.name || "Unknown"}</div>
                    <div className="mt-1 truncate text-xs text-white/70 sm:text-sm">{user?.email || "—"}</div>
                    <div className="mt-2 flex flex-wrap justify-center gap-2 lg:mt-3">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/80 sm:px-2.5 sm:py-1">{user?.role || "User"}</span>
                      <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 sm:px-2.5 sm:py-1">{user?.accountStatus || "Protected"}</span>
                    </div>
                  </div>

                  <div className="mt-3 w-full space-y-2 lg:mt-6">
                    <button onClick={handleEdit} className="w-full rounded-md border border-white/6 bg-white/3 px-2 py-1.5 text-xs font-semibold text-white hover:bg-white/5 sm:px-3 sm:py-2 sm:text-sm">Edit Profile</button>
                    <button onClick={handlePassword} className="w-full rounded-md border border-white/6 bg-transparent px-2 py-1.5 text-xs text-white/80 hover:bg-white/3 sm:px-3 sm:py-2 sm:text-sm">Change Password</button>
                    <button onClick={handleManage} className="w-full rounded-md border border-white/6 bg-transparent px-2 py-1.5 text-xs text-white/80 hover:bg-white/3 sm:px-3 sm:py-2 sm:text-sm">Manage Account</button>
                    <button onClick={handleLogout} className="w-full rounded-md bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:brightness-95 sm:px-3 sm:py-2 sm:text-sm">Logout</button>
                  </div>
                </div>
              </div>

              <div className="w-full flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-white sm:text-lg">Personal Information</h3>
                  <button onClick={onClose} className="self-end rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/8 sm:self-auto sm:px-3 sm:py-1 sm:text-sm">Close</button>
                </div>

                <div className="mt-3 grid w-full gap-3 sm:mt-4 sm:gap-4 md:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <label className="truncate text-xs text-white/60">Full Name</label>
                    <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">{user?.name || "—"}</div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <label className="truncate text-xs text-white/60">Email Address</label>
                    <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">{user?.email || "—"}</div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <label className="truncate text-xs text-white/60">Phone Number</label>
                    <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">{phone || "—"}</div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <label className="truncate text-xs text-white/60">Organization / Workspace</label>
                    <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">{org}</div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <label className="truncate text-xs text-white/60">Role</label>
                    <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">{user?.role || "—"}</div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <label className="truncate text-xs text-white/60">Joined Date</label>
                    <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">{joinedDate || "—"}</div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/60 sm:mt-6 sm:text-sm">This modal shows account-level information only. Manage preferences and analytics from the Dashboard and Settings pages.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
