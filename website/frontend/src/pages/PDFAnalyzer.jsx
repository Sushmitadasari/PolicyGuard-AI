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

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";

import StatsCard from "../components/common/StatsCard";

import UploadBox from "../components/common/UploadBox";

import AIStatusBadge from "../components/common/AIStatusBadge";

import { uploadPDF } from "../services/pdfService";
import { useAnalytics } from "../context/AnalyticsContext";

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
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const [uploadProgress,
    setUploadProgress] =
    useState(0);

  const [fileName,
    setFileName] =
    useState("");

  const [analyzing,
    setAnalyzing] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const [aiSummary,
    setAiSummary] =
    useState("");

  const [riskScore,
    setRiskScore] =
    useState(82);

  const [selectedTab,
    setSelectedTab] =
    useState("overview");

  const handleUpload = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setAnalyzing(true);
    setError("");
    setAiSummary("");
    setUploadProgress(0);

    try {
      // Show progress animation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress < 90) {
          setUploadProgress(Math.min(progress, 90));
        }
      }, 300);

      // Call backend API
      const response = await uploadPDF(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Backend returns analysis data
      const analysisData = response.data;

      analytics?.setLatestAnalysis?.("pdf", analysisData);

      await analytics?.refreshAnalytics?.();

      // Navigate to result page with data
      setTimeout(() => {
        navigate("/pdf-result", {
          state: analysisData,
        });
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to upload and analyze PDF. Please try again."
      );
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout>

      {/* HEADER */}
      <PageHeader
        title="PDF Analyzer"
        subtitle="Enterprise AI contract intelligence platform for analyzing legal documents and privacy policies."
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

        </div>

      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 font-semibold">
          {error}
        </div>
      )}

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

      


    

    </DashboardLayout>
  );
}

export default PDFAnalyzer;