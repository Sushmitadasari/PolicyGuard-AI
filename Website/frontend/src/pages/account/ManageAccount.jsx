import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function ManageAccount() {
  const { user, logout } =
    useAuth();

  return (
    <div className="min-h-screen bg-[#020817] p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold">
                Manage Account
              </h1>

              <p className="mt-3 text-white/60">
                Control your account,
                sessions, and security.
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-2xl bg-red-500 px-6 py-3 font-semibold transition-all hover:bg-red-400"
            >
              Logout Account
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <ManageCard
              title="Account Role"
              value={user?.role || "User"}
            />

            <ManageCard
              title="Status"
              value={
                user?.accountStatus ||
                "Active"
              }
            />

            <ManageCard
              title="Email"
              value={
                user?.email || "—"
              }
            />
          </div>

          <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">

            <h2 className="text-2xl font-bold text-red-300">
              Danger Zone
            </h2>

            <p className="mt-3 text-white/60">
              Permanently delete your
              account and all associated
              data.
            </p>

            <button className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition-all hover:bg-red-500/20">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ManageCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
      <p className="text-sm text-white/50">
        {title}
      </p>

      <h3 className="mt-3 text-xl font-bold">
        {value}
      </h3>
    </div>
  );
}