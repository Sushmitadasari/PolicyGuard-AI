import React, {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";

import AIStatusBadge from "../components/common/AIStatusBadge";

function Toggle({
  enabled,
  setEnabled,
}) {
  return (
    <motion.button
      whileTap={{
        scale: 0.95,
      }}
      onClick={() =>
        setEnabled(!enabled)
      }
      className={`w-16 h-9 rounded-full flex items-center px-1 transition-all ${
        enabled
          ? "bg-blue-600 justify-end"
          : "bg-white/10 justify-start"
      }`}
    >

      <motion.div
        layout
        className="w-7 h-7 rounded-full bg-white"
      />

    </motion.button>
  );
}

function Settings() {
  const [twoFA,
    setTwoFA] =
    useState(true);

  const [biometric,
    setBiometric] =
    useState(false);

  const [autoAnalysis,
    setAutoAnalysis] =
    useState(true);

  const [aiNotify,
    setAiNotify] =
    useState(true);

  const [websiteMonitoring,
    setWebsiteMonitoring] =
    useState(true);

  const [emailAlerts,
    setEmailAlerts] =
    useState(true);

  const [compactMode,
    setCompactMode] =
    useState(false);

  const handleSave = () => {
    alert(
      "Settings saved successfully!"
    );
  };

  const handleExport = () => {
    alert(
      "Exporting all settings..."
    );
  };

  const handleBackup = () => {
    alert(
      "Backup created successfully!"
    );
  };

  const handleClear = () => {
    alert(
      "History cleared successfully!"
    );
  };

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}
      <PageHeader
        title="Settings"
        subtitle="Manage your AI platform preferences, notifications, and enterprise security."
        actionButton={
          <AIStatusBadge status="Active" />
        }
      />

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-10 mb-10">

        <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10">

          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">

            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

            <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-black">
              ENTERPRISE CONTROL PANEL
            </span>

          </div>

          <h2 className="text-5xl font-black leading-tight mb-6 max-w-4xl">
            Configure your AI protection ecosystem.
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            Customize security preferences, AI automation, notifications, monitoring systems, and enterprise intelligence controls.
          </p>

        </div>

      </section>

      {/* SETTINGS GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* SECURITY */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-3xl font-black">
                Security
              </h3>

              <p className="text-white/40 mt-2">
                Enterprise authentication and protection controls
              </p>

            </div>

            <div className="text-5xl">
              🔐
            </div>

          </div>

          <div className="space-y-6">

            <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

              <div>

                <h4 className="font-bold">
                  Two Factor Authentication
                </h4>

                <p className="text-sm text-white/40 mt-1">
                  Add extra login protection.
                </p>

              </div>

              <Toggle
                enabled={twoFA}
                setEnabled={setTwoFA}
              />

            </div>

            <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

              <div>

                <h4 className="font-bold">
                  Biometric Login
                </h4>

                <p className="text-sm text-white/40 mt-1">
                  Use fingerprint or face authentication.
                </p>

              </div>

              <Toggle
                enabled={biometric}
                setEnabled={setBiometric}
              />

            </div>

            <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

              <div>

                <h4 className="font-bold">
                  Website Monitoring
                </h4>

                <p className="text-sm text-white/40 mt-1">
                  Continuously monitor privacy changes.
                </p>

              </div>

              <Toggle
                enabled={websiteMonitoring}
                setEnabled={
                  setWebsiteMonitoring
                }
              />

            </div>

          </div>

        </motion.div>

        {/* AI SETTINGS */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-3xl font-black">
                AI Preferences
              </h3>

              <p className="text-white/40 mt-2">
                Configure intelligent automation systems
              </p>

            </div>

            <div className="text-5xl">
              🤖
            </div>

          </div>

          <div className="space-y-6">

            <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

              <div>

                <h4 className="font-bold">
                  Auto Analysis
                </h4>

                <p className="text-sm text-white/40 mt-1">
                  Analyze uploaded files automatically.
                </p>

              </div>

              <Toggle
                enabled={autoAnalysis}
                setEnabled={
                  setAutoAnalysis
                }
              />

            </div>

            <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

              <div>

                <h4 className="font-bold">
                  AI Notifications
                </h4>

                <p className="text-sm text-white/40 mt-1">
                  Receive intelligent alerts.
                </p>

              </div>

              <Toggle
                enabled={aiNotify}
                setEnabled={setAiNotify}
              />

            </div>

            <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

              <div>

                <h4 className="font-bold">
                  Compact Dashboard Mode
                </h4>

                <p className="text-sm text-white/40 mt-1">
                  Use minimal analytics layout.
                </p>

              </div>

              <Toggle
                enabled={compactMode}
                setEnabled={
                  setCompactMode
                }
              />

            </div>

          </div>

        </motion.div>

      </section>

      {/* NOTIFICATIONS */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl mb-10">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h3 className="text-3xl font-black">
              Notifications
            </h3>

            <p className="text-white/40 mt-2">
              Manage AI alerts and communication preferences
            </p>

          </div>

          <div className="text-5xl">
            🔔
          </div>

        </div>

        <div className="space-y-6">

          <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

            <div>

              <h4 className="font-bold">
                Email Alerts
              </h4>

              <p className="text-sm text-white/40 mt-1">
                Receive AI-generated risk notifications.
              </p>

            </div>

            <Toggle
              enabled={emailAlerts}
              setEnabled={
                setEmailAlerts
              }
            />

          </div>

          <div className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/5">

            <div>

              <h4 className="font-bold">
                Threat Intelligence Feed
              </h4>

              <p className="text-sm text-white/40 mt-1">
                Enable real-time cybersecurity insights.
              </p>

            </div>

            <Toggle
              enabled={true}
              setEnabled={() => {}}
            />

          </div>

        </div>

      </section>

      {/* STORAGE */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl mb-10">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h3 className="text-3xl font-black">
              Storage & Data
            </h3>

            <p className="text-white/40 mt-2">
              Manage backups, exports, and history
            </p>

          </div>

          <div className="text-5xl">
            💾
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <button
            onClick={handleExport}
            className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-600/20"
          >
            Export Data
          </button>

          <button
            onClick={handleBackup}
            className="h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold hover:bg-yellow-500/20 transition-all"
          >
            Backup Settings
          </button>

          <button
            onClick={handleClear}
            className="h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all"
          >
            Clear History
          </button>

        </div>

      </section>

      {/* SAVE BUTTON */}
      <motion.button
        whileHover={{
          scale: 1.01,
        }}
        whileTap={{
          scale: 0.98,
        }}
        onClick={handleSave}
        className="w-full h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-lg shadow-2xl shadow-blue-500/20"
      >
        Save All Changes
      </motion.button>

    </DashboardLayout>
  );
}

export default Settings;