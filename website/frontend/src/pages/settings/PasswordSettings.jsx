import React, { useState } from "react";
import { motion } from "framer-motion";

export default function PasswordSettings() {
  const [formData, setFormData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleUpdatePassword =
    async () => {
      try {
        setLoading(true);

        // API CALL HERE

        setTimeout(() => {
          setLoading(false);
        }, 1200);
      } catch (error) {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-[#020817] p-6 text-white">
      <div className="mx-auto max-w-3xl">

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
          <h1 className="text-3xl font-bold">
            Change Password
          </h1>

          <p className="mt-3 text-white/60">
            Secure your account with
            a strong password.
          </p>

          <div className="mt-10 space-y-6">

            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={
                formData.currentPassword
              }
              onChange={handleChange}
            />

            <PasswordInput
              label="New Password"
              name="newPassword"
              value={
                formData.newPassword
              }
              onChange={handleChange}
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
            />
          </div>

          <button
            onClick={
              handleUpdatePassword
            }
            className="mt-8 w-full rounded-2xl bg-cyan-500 py-4 font-semibold text-black transition-all hover:bg-cyan-400"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function PasswordInput({
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
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition-all focus:border-cyan-400"
      />
    </div>
  );
}