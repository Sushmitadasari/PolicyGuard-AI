import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const getDisplayName = (user) => {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Unknown User"
  );
};

const getRoleLabel = (role) => {
  if (!role) return "User";

  const normalized = role.toLowerCase();

  if (normalized === "admin") {
    return "Administrator";
  }

  if (normalized === "enterprise") {
    return "Enterprise User";
  }

  if (normalized === "analyst") {
    return "AI Analyst";
  }

  return role;
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";

  const normalized = status.toLowerCase();

  if (normalized === "active") {
    return "Active";
  }

  if (normalized === "protected") {
    return "Protected";
  }

  if (normalized === "suspended") {
    return "Suspended";
  }

  return status;
};

export default function ProfileModal({
  open,
  onClose,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const displayName =
    getDisplayName(user);

  const roleLabel =
    getRoleLabel(user?.role);

  const statusLabel =
    getStatusLabel(
      user?.accountStatus
    );

  const profileImage =
    user?.profilePic ||
    user?.avatar ||
    null;

  const org =
    user?.organization ||
    user?.workspace ||
    user?.company ||
    user?.department ||
    "Not Assigned";

  const phone =
    user?.phone ||
    user?.mobile ||
    user?.contactNumber ||
    "Not Added";

  const joinedDate = useMemo(() => {
    const date =
      user?.createdAt ||
      user?.joinedAt ||
      user?.registeredAt;

    if (!date) {
      return "Recently Joined";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Recently Joined";
    }
  }, [user]);

  const handleEdit = () =>
    navigate("/settings/profile");

  const handlePassword = () =>
    navigate("/settings/password");

  const handleManage = () =>
    navigate("/account/manage");

  const handleLogout = () => {
    try {
      logout?.();
    } catch (e) {
      console.warn(
        "Logout failed",
        e
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
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
            initial={{
              y: 8,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 8,
              opacity: 0,
            }}
            transition={{
              duration: 0.16,
            }}
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "calc(var(--topbar-height, 6rem) + 0.75rem)",
              left: "1rem",
              right: "1rem",
              maxHeight:
                "calc(100vh - var(--topbar-height, 6rem) - 2rem)",
              width: "auto",
              maxWidth: "42rem",
              marginLeft: "auto",
              marginRight: "auto",
              overflowY: "auto",
            }}
            className="z-[10000] rounded-2xl border border-white/10 bg-[#07111f]/95 p-3 shadow-2xl sm:p-6"
          >
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-6">

              {/* LEFT PANEL */}
              <div className="w-full lg:w-56 flex-shrink-0">
                <div className="flex h-full flex-col items-center gap-3 lg:gap-4">

                  {/* PROFILE IMAGE */}
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-md">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-extrabold">
                        {displayName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* USER INFO */}
                  <div className="w-full text-center">
                    <div className="truncate text-sm font-semibold text-white sm:text-base">
                      {displayName}
                    </div>

                    <div className="mt-1 truncate text-xs text-white/70 sm:text-sm">
                      {user?.email || "—"}
                    </div>

                    <div className="mt-2 flex flex-wrap justify-center gap-2 lg:mt-3">

                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/80 sm:px-2.5 sm:py-1">
                        {roleLabel}
                      </span>

                      <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 sm:px-2.5 sm:py-1">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="mt-3 w-full space-y-2 lg:mt-6">

                    <button
                      onClick={handleEdit}
                      className="w-full rounded-md border border-white/6 bg-white/3 px-2 py-1.5 text-xs font-semibold text-white hover:bg-white/5 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Edit Profile
                    </button>

                    <button
                      onClick={
                        handlePassword
                      }
                      className="w-full rounded-md border border-white/6 bg-transparent px-2 py-1.5 text-xs text-white/80 hover:bg-white/3 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Change Password
                    </button>

                    <button
                      onClick={handleManage}
                      className="w-full rounded-md border border-white/6 bg-transparent px-2 py-1.5 text-xs text-white/80 hover:bg-white/3 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Manage Account
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:brightness-95 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="w-full flex-1">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    Personal Information
                  </h3>

                  <button
                    onClick={onClose}
                    className="self-end rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/8 sm:self-auto sm:px-3 sm:py-1 sm:text-sm"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-3 grid w-full gap-3 sm:mt-4 sm:gap-4 md:grid-cols-2">

                  <InfoCard
                    label="Full Name"
                    value={displayName}
                  />

                  <InfoCard
                    label="Email Address"
                    value={
                      user?.email || "—"
                    }
                  />

                  <InfoCard
                    label="Phone Number"
                    value={phone}
                  />

                  <InfoCard
                    label="Organization"
                    value={org}
                  />

                  <InfoCard
                    label="Role"
                    value={roleLabel}
                  />

                  <InfoCard
                    label="Joined Date"
                    value={joinedDate}
                  />
                </div>

                <div className="mt-4 text-xs text-white/60 sm:mt-6 sm:text-sm">
                  This profile is loaded
                  dynamically from your
                  authenticated account.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">

      <label className="truncate text-xs text-white/60">
        {label}
      </label>

      <div className="overflow-hidden rounded-md bg-black/20 px-2 py-1.5 text-xs text-white sm:px-3 sm:py-2 sm:text-sm">
        {value}
      </div>
    </div>
  );
}