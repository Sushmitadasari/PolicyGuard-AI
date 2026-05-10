import React, { useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

import { motion } from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { triggerDashboardRefresh } from "../utils/dashboardEvents";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";

import StatsCard from "../components/common/StatsCard";

import AIStatusBadge from "../components/common/AIStatusBadge";

const PIE_DATA = [
  { name: "Safe", value: 40 },
  { name: "Moderate", value: 30 },
  { name: "Risky", value: 20 },
  { name: "Critical", value: 10 },
];

const TRACKING_DATA = [
  { month: "Jan", value: 20 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 42 },
  { month: "Apr", value: 60 },
  { month: "May", value: 75 },
  { month: "Jun", value: 90 },
];

const POLICY_DATA = [
  { name: "Cookies", score: 82 },
  { name: "Tracking", score: 95 },
  { name: "Ads", score: 70 },
  { name: "Security", score: 45 },
  { name: "Sharing", score: 88 },
];

function WebsiteAnalyzer() {
  const [url, setUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showResults,
    setShowResults] =
    useState(false);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  const startAnalysis = async () => {
    if (!url.trim()) {
      setError("Please enter website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setShowResults(false);

    try {
      const payload = { url: url.trim() };
      const res = await api.post("/website/analyze", payload);

      // notify dashboard to refresh
      try { triggerDashboardRefresh(); } catch (_) {}

      // on success navigate to result page and pass data
      navigate("/website-result", { state: res.data });
    } catch (err) {
      console.error("Website analyze error:", err);
      setError(
        err?.response?.data?.message || "Failed to analyze website. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (
    action
  ) => {
    alert(`${action} initiated.`);
  };

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}
      <PageHeader
        title="Website Analyzer"
        subtitle="AI-powered enterprise website privacy intelligence and legal risk detection."
       
      />

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-10 mb-10">

        <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">

          <div>

            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">

              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

              <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-black">
                LIVE AI WEBSITE SCANNER
              </span>

            </div>

            <h2 className="text-5xl font-black leading-tight mb-6 max-w-4xl">
              Analyze website privacy risks instantly.
            </h2>

            <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
              Detect hidden tracking systems, third-party data sharing, suspicious clauses, AI-generated risk intelligence, and privacy vulnerabilities in real-time.
            </p>

          </div>


        </div>

      </section>

      

      {/* URL SCANNER */}
      <section className="rounded-[3rem] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-3xl mb-10">

        <div className="flex flex-col xl:flex-row gap-6">

          <div className="flex-1">

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
              className="w-full h-20 rounded-[2rem] bg-white/[0.03] border border-blue-500/20 px-6 outline-none text-lg focus:border-blue-500 text-white placeholder:text-white/30"
            />

            {error && (
              <p className="text-red-400 mt-3">
                {error}
              </p>
            )}

          </div>

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={startAnalysis}
            className="xl:w-[260px] h-20 rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-lg shadow-2xl shadow-blue-600/20"
          >
            Analyze Website
          </motion.button>

        </div>

      </section>

      {/* LOADER */}
      {loading && (

        <section className="rounded-[3rem] border border-white/10 bg-white/[0.03] p-20 text-center mb-10 backdrop-blur-3xl">

          <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-8" />

          <h3 className="text-4xl font-black mb-4">
            AI Scanning Website
          </h3>

          <p className="text-slate-400 text-lg">
            Detecting privacy risks, hidden trackers, and suspicious behavior patterns...
          </p>

        </section>

      )}

      {/* RESULTS */}
      {showResults &&
        !loading && (
          <>

            {/* SCORE CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

              {[
                {
                  title:
                    "Risk Score",
                  value: "76%",
                  color:
                    "text-red-400",
                  icon: "⚠️",
                },
                {
                  title:
                    "Tracking Scripts",
                  value: "24",
                  color:
                    "text-orange-400",
                  icon: "📡",
                },
                {
                  title:
                    "Third-party APIs",
                  value: "12",
                  color:
                    "text-yellow-400",
                  icon: "🔗",
                },
                {
                  title:
                    "AI Confidence",
                  value: "97%",
                  color:
                    "text-green-400",
                  icon: "🤖",
                },
              ].map(
                (
                  item,
                  index
                ) => (

                  <motion.div
                    key={index}
                    whileHover={{
                      y: -5,
                    }}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl"
                  >

                    <div className="flex items-center justify-between mb-6">

                      <div className="text-4xl">
                        {item.icon}
                      </div>

                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />

                    </div>

                    <p className="text-white/40 text-sm uppercase tracking-[0.2em] font-bold mb-4">
                      {item.title}
                    </p>

                    <h3
                      className={`text-5xl font-black ${item.color}`}
                    >
                      {item.value}
                    </h3>

                  </motion.div>

                )
              )}

            </section>

            {/* CHARTS */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

              {/* PIE */}
              <motion.div
                whileHover={{
                  y: -4,
                }}
                className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl"
              >

                <div className="flex items-center justify-between mb-8">

                  <div>

                    <h3 className="text-3xl font-black">
                      Risk Distribution
                    </h3>

                    <p className="text-white/40 mt-2">
                      AI-detected website privacy exposure
                    </p>

                  </div>

                  <div className="text-5xl">
                    ⚠️
                  </div>

                </div>

                <div className="h-[320px]">

                  <ResponsiveContainer>

                    <PieChart>

                      <Pie
                        data={PIE_DATA}
                        dataKey="value"
                        innerRadius={70}
                        outerRadius={110}
                        stroke="none"
                      >

                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#dc2626" />

                      </Pie>

                      <Tooltip />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </motion.div>

              {/* AREA */}
              <motion.div
                whileHover={{
                  y: -4,
                }}
                className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl"
              >

                <div className="flex items-center justify-between mb-8">

                  <div>

                    <h3 className="text-3xl font-black">
                      Tracking Analytics
                    </h3>

                    <p className="text-white/40 mt-2">
                      Real-time tracking detection growth
                    </p>

                  </div>

                  <div className="text-5xl">
                    📈
                  </div>

                </div>

                <div className="h-[320px]">

                  <ResponsiveContainer>

                    <AreaChart
                      data={TRACKING_DATA}
                    >

                      <defs>

                        <linearGradient
                          id="trackGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.8}
                          />

                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff08"
                      />

                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                      />

                      <YAxis
                        stroke="#94a3b8"
                      />

                      <Tooltip />

                      <Area
                        dataKey="value"
                        stroke="#2563eb"
                        fill="url(#trackGradient)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              </motion.div>

            </section>

            {/* BAR CHART */}
            <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl mb-10">

              <div className="flex items-center justify-between mb-8">

                <div>

                  <h3 className="text-3xl font-black">
                    Transparency Metrics
                  </h3>

                  <p className="text-white/40 mt-2">
                    AI-generated website transparency analysis
                  </p>

                </div>

                <div className="text-5xl">
                  📊
                </div>

              </div>

              <div className="h-[350px]">

                <ResponsiveContainer>

                  <BarChart
                    data={POLICY_DATA}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ffffff08"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                    />

                    <YAxis hide />

                    <Tooltip />

                    <Bar
                      dataKey="score"
                      fill="#2563eb"
                      radius={[
                        10,
                        10,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </section>

            {/* QUICK ACTIONS */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">

              {[
                "Download",
                "Export",
                "Monitor",
                "Compare",
                "Share",
                "AI Assistant",
              ].map(
                (
                  item,
                  index
                ) => (

                  <motion.button
                    key={index}
                    whileHover={{
                      y: -5,
                    }}
                    onClick={() =>
                      quickAction(
                        item
                      )
                    }
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 font-bold backdrop-blur-3xl hover:bg-white/[0.06] transition-all"
                  >
                    {item}
                  </motion.button>

                )
              )}

            </section>

          </>
        )}

    </DashboardLayout>
  );
}

export default WebsiteAnalyzer;