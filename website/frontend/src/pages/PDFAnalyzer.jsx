import React, { useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { motion } from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";

import StatsCard from "../components/common/StatsCard";

import UploadBox from "../components/common/UploadBox";

import AIStatusBadge from "../components/common/AIStatusBadge";

const PIE_DATA = [
  { name: "Safe", value: 45 },
  { name: "Warning", value: 30 },
  { name: "High Risk", value: 25 },
];

const BAR_DATA = [
  { name: "Privacy", score: 82 },
  { name: "Payments", score: 67 },
  { name: "Tracking", score: 91 },
  { name: "Liability", score: 96 },
  { name: "Security", score: 54 },
];

const CLAUSES = [
  {
    title: "Third-Party Data Sharing",
    severity: "High",
    text:
      "We may share user data with third-party advertisers.",
  },
  {
    title: "Automatic Renewal",
    severity: "Medium",
    text:
      "Subscription renews automatically unless canceled.",
  },
  {
    title: "Liability Waiver",
    severity: "Critical",
    text:
      "Company shall not be liable for indirect damages.",
  },
];

function PDFAnalyzer() {
  const [uploadProgress,
    setUploadProgress] =
    useState(0);

  const [fileName,
    setFileName] =
    useState("");

  const [analyzing,
    setAnalyzing] =
    useState(false);

  const [aiSummary,
    setAiSummary] =
    useState("");

  const [riskScore,
    setRiskScore] =
    useState(82);

  const [selectedTab,
    setSelectedTab] =
    useState("overview");

  const handleUpload = (file) => {
    if (!file) return;

    setFileName(file.name);

    setAnalyzing(true);

    setAiSummary("");

    let progress = 0;

    const interval =
      setInterval(() => {

        progress += 5;

        setUploadProgress(progress);

        if (progress >= 100) {

          clearInterval(interval);

          setTimeout(() => {

            setAnalyzing(false);

            setAiSummary(
              "AI detected multiple risky clauses related to tracking, liability limitations, and automatic renewals. Policy contains moderate-to-high legal exposure risks."
            );

            setRiskScore(87);

          }, 1200);

        }

      }, 180);
  };

  return (
    <DashboardLayout>

      {/* HEADER */}
      <PageHeader
        title="PDF Analyzer"
        subtitle="Enterprise AI contract intelligence platform for analyzing legal documents and privacy policies."
        actionButton={
          <div className="flex gap-4">

            <button className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-600/20">
              Generate Report
            </button>

            <button className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-bold">
              Compliance Scan
            </button>

          </div>
        }
      />

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-10 mb-10">

        <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">

          <div>

            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">

              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

              <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-black">
                AI Document Scanner
              </span>

            </div>

            <h2 className="text-5xl font-black leading-tight mb-5">
              Upload contracts and let AI uncover hidden risks instantly.
            </h2>

            <p className="text-white/40 text-lg leading-relaxed max-w-3xl">
              Analyze legal contracts, NDAs, agreements, privacy policies, and compliance documents using enterprise-grade neural intelligence systems.
            </p>

          </div>

          <AIStatusBadge status="Active" />

        </div>

      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <StatsCard
          title="Contracts Processed"
          value="12.4K"
          growth="+12%"
          icon="📄"
        />

        <StatsCard
          title="AI Accuracy"
          value="98.9%"
          growth="+6%"
          icon="🤖"
        />

        <StatsCard
          title="Risk Alerts"
          value="1.8K"
          growth="+18%"
          icon="⚠️"
        />

        <StatsCard
          title="Safe Policies"
          value="64%"
          growth="+4%"
          icon="🛡️"
        />

      </section>

      {/* UPLOAD + AI */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* UPLOAD */}
        <UploadBox
          acceptedFiles=".pdf"
          loading={analyzing}
          onUpload={handleUpload}
        />

        {/* AI STATUS */}
        <div className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-3xl font-black">
                AI Analysis Status
              </h3>

              <p className="text-white/40 mt-2">
                Live enterprise neural analysis
              </p>

            </div>

            <AIStatusBadge status="Scanning" />

          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-8">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h4 className="font-bold text-lg">
                  {fileName ||
                    "No File Uploaded"}
                </h4>

                <p className="text-white/40 text-sm mt-2">
                  Enterprise AI Contract Scanner
                </p>

              </div>

              <div className="text-4xl">
                📂
              </div>

            </div>

            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-4">

              <motion.div
                animate={{
                  width: `${uploadProgress}%`,
                }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              />

            </div>

            <div className="flex items-center justify-between text-sm">

              <span className="text-white/50">

                {analyzing
                  ? "Analyzing document..."
                  : "Ready"}

              </span>

              <span className="font-bold">
                {uploadProgress}%
              </span>

            </div>

          </div>

          {/* AI SUMMARY */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">

            <div className="flex items-center gap-4 mb-5">

              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                🤖
              </div>

              <div>

                <h4 className="font-black">
                  AI Summary
                </h4>

                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mt-1">
                  Neural Risk Detection
                </p>

              </div>

            </div>

            <p className="text-white/60 leading-relaxed">

              {aiSummary ||
                "Upload a legal document to receive AI-generated risk summaries and intelligent clause detection."}

            </p>

          </div>

        </div>

      </section>

      {/* TABS */}
      <section className="flex flex-wrap gap-4 mb-10">

        {[
          "overview",
          "clauses",
          "analytics",
          "compliance",
        ].map((tab) => (

          <button
            key={tab}
            onClick={() =>
              setSelectedTab(tab)
            }
            className={`px-6 py-3 rounded-2xl text-sm uppercase tracking-[0.2em] font-black transition-all ${
              selectedTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white/[0.03] border border-white/10 text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>

        ))}

      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* PIE */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-3xl font-black">
                Risk Breakdown
              </h3>

              <p className="text-white/40 mt-2">
                AI-detected legal exposure
              </p>

            </div>

            <div className="text-5xl">
              ⚠️
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={PIE_DATA}
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  paddingAngle={6}
                  stroke="none"
                >

                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        {/* BAR */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-3xl font-black">
                Clause Distribution
              </h3>

              <p className="text-white/40 mt-2">
                Neural analysis distribution
              </p>

            </div>

            <div className="text-5xl">
              📊
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={BAR_DATA}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff08"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis hide />

                <Tooltip />

                <Bar
                  dataKey="score"
                  fill="#2563eb"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

      </section>

      {/* AI SCORE */}
      <section className="rounded-[3rem] border border-white/10 bg-gradient-to-br from-red-500/10 to-transparent p-10 mb-10 backdrop-blur-3xl">

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">

          <div>

            <h2 className="text-5xl font-black mb-5">
              Overall AI Risk Score
            </h2>

            <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
              PolicyGuard AI evaluates legal exposure, privacy concerns, tracking behavior, hidden clauses, and compliance risks.
            </p>

          </div>

          <div className="relative">

            <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full" />

            <div className="relative w-48 h-48 rounded-full border-[12px] border-red-500/20 flex items-center justify-center bg-black/30 backdrop-blur-3xl">

              <div className="text-center">

                <h3 className="text-6xl font-black text-red-400">
                  {riskScore}
                </h3>

                <p className="text-xs uppercase tracking-[0.3em] text-white/40 mt-3">
                  Risk Score
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* RISK CLAUSES */}
      <section className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 mb-10">

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-10">

          <div>

            <h2 className="text-4xl font-black mb-3">
              Highlighted Risky Clauses
            </h2>

            <p className="text-white/40">
              AI-detected legal and privacy concerns
            </p>

          </div>

          <button className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-bold">
            Export Analysis
          </button>

        </div>

        <div className="space-y-6">

          {CLAUSES.map((clause,
            index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -4,
              }}
              className="rounded-[2rem] border border-white/10 p-8 bg-black/20"
            >

              <div className="flex flex-col xl:flex-row items-start justify-between gap-6 mb-5">

                <div>

                  <h3 className="text-2xl font-black mb-3">
                    {clause.title}
                  </h3>

                  <p className="text-white/70 leading-relaxed">
                    {clause.text}
                  </p>

                </div>

                <div className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-xs uppercase tracking-[0.2em] font-black">
                  {clause.severity}
                </div>

              </div>

            </motion.div>

          ))}

        </div>

      </section>

    </DashboardLayout>
  );
}

export default PDFAnalyzer;