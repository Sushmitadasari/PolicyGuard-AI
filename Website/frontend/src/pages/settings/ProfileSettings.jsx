import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function ProfileSettings() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // API CALL HERE

      setTimeout(() => {
        setSaving(false);
      }, 1200);
    } catch (error) {
      setSaving(false);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-4xl font-black shadow-lg">
                {(user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Profile Settings
                </h1>

                <p className="mt-2 text-white/60">
                  Manage your account information dynamically.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                    {user?.role || "User"}
                  </span>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                    {user?.accountStatus || "Active"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-black transition-all hover:scale-[1.02] hover:bg-cyan-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            <InputCard
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <InputCard
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <InputCard
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <InputCard
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-lg font-semibold">
              Account Overview
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-3">

              <StatCard
                title="Member Since"
                value={
                  user?.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString()
                    : "Recently"
                }
              />

              <StatCard
                title="Current Role"
                value={user?.role || "User"}
              />

              <StatCard
                title="Security Status"
                value={
                  user?.accountStatus ||
                  "Protected"
                }
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InputCard({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/70">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition-all focus:border-cyan-400"
      />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-white/50">
        {title}
      </p>

      <h4 className="mt-2 text-xl font-bold">
        {value}
      </h4>
    </div>
  );
}