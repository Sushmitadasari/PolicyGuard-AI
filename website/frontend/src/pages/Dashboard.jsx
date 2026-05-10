import React, { useState, useEffect, useRef } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { subscribeDashboardRefresh } from "../utils/dashboardEvents";

/* REUSABLE COMPONENTS */
import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";

import StatsCard from "../components/common/StatsCard";

import RiskCard from "../components/common/RiskCard";

import AIStatusBadge from "../components/common/AIStatusBadge";

const COLORS = {
  primary: "#2563eb",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const analyticsData = [
  {
    name: "Jan",
    scans: 120,
  },
  {
    name: "Feb",
    scans: 180,
  },
  {
    name: "Mar",
    scans: 240,
  },
  {
    name: "Apr",
    scans: 320,
  },
  {
    name: "May",
    scans: 390,
  },
  {
    name: "Jun",
    scans: 460,
  },
];

const riskDistribution = [
  {
    name: "Safe",
    value: 68,
    color: COLORS.success,
  },
  {
    name: "Warning",
    value: 22,
    color: COLORS.warning,
  },
  {
    name: "Danger",
    value: 10,
    color: COLORS.danger,
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: null,
    averageRisk: null,
    recentScans: analyticsData,
    riskDistribution: riskDistribution,
    aiAccuracy: null,
  });

  const isMounted = useRef(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/history/dashboard-stats");
      const payload = res.data?.stats ?? res.stats ?? res.data ?? res;

      // Helper: aggregate recent items (array of records) into {name: Month, scans: count}
      const aggregateRecentItems = (items = []) => {
        if (!Array.isArray(items)) return [];
        const counts = {};
        items.forEach((it) => {
          const date = it.createdAt || it.date || it.metadata?.processedAt || null;
          if (!date) return;
          try {
            const d = new Date(date);
            if (Number.isNaN(d.getTime())) return;
            const month = d.toLocaleString('en-US', { month: 'short' });
            counts[month] = (counts[month] || 0) + 1;
          } catch (e) {
            // ignore
          }
        });
        // Convert to array
        return Object.keys(counts).map((m) => ({ name: m, scans: counts[m] }));
      };

      const totalAnalyses = payload?.totalAnalyses ?? payload?.total_analyses ?? payload?.total ?? payload?.totalCount ?? null;
      const averageRisk = payload?.averageRiskScore ?? payload?.averageRisk ?? payload?.avgRisk ?? payload?.average_risk ?? null;
      const confidence = payload?.averageConfidence ?? payload?.average_confidence ?? null;

      const recentItemsRaw = Array.isArray(payload?.recentItems) ? payload.recentItems : Array.isArray(payload?.recent) ? payload.recent : [];
      const recentScansData = aggregateRecentItems(recentItemsRaw);

      const breakdownRaw = payload?.riskLevelBreakdown ?? payload?.risk_distribution ?? {};
      const breakdownEntries = typeof breakdownRaw === 'object' && !Array.isArray(breakdownRaw) ? Object.entries(breakdownRaw) : [];
      const sum = breakdownEntries.reduce((s, [, v]) => s + (Number(v) || 0), 0) || 0;
      const distribution = breakdownEntries.map(([name, value]) => ({
        name,
        value: sum ? Math.round((Number(value) / sum) * 100) : 0,
        color: name === 'Safe' ? COLORS.success : name === 'Warning' ? COLORS.warning : COLORS.danger,
      }));

      const aiAccuracy = payload?.aiAccuracy ?? payload?.ai_accuracy ?? payload?.modelAccuracy ?? null;

      if (isMounted.current) {
        setStats({
          totalAnalyses,
          averageRisk,
          confidence,
          recentScans: recentScansData,
          riskDistribution: distribution,
          aiAccuracy,
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      if (isMounted.current) setLoadingStats(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchStats();
    const unsubscribe = subscribeDashboardRefresh(() => fetchStats());
    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}
      <PageHeader
        title="AI Security Dashboard"
        subtitle="Monitoring active legal and privacy risk intelligence."
        
      />

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-10 mb-10">

        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 max-w-3xl">

          <h2 className="text-5xl font-black leading-tight mb-6">

            Your
            <span className="text-blue-400">
              {" "}AI legal protection system{" "}
            </span>
            is fully active.

          </h2>

          <p className="text-slate-400 text-lg leading-relaxed mb-8">

            PolicyGuard AI is continuously analyzing privacy policies,
            contracts, and terms & conditions to detect hidden legal
            and security risks.

          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-4">

            <button
              onClick={() =>
                navigate("/pdf-analyzer")
              }
              className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-600/20"
            >
              Upload PDF
            </button>

            <button
              onClick={() =>
                navigate("/website-analyzer")
              }
              className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
            >
              Scan Website
            </button>


            <button
              onClick={() =>
                navigate("/history")
              }
              className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
            >
              View History
            </button>

          </div>

        </div>

      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <StatsCard
          title="Policies Analyzed"
          value={loadingStats ? "Loading..." : stats.totalAnalyses ?? "N/A"}
          growth={loadingStats ? "" : ""}
          icon="📄"
        />

        <StatsCard
          title="Average Risk"
          value={loadingStats ? "Loading..." : stats.averageRisk != null ? `${Math.round(stats.averageRisk)}%` : "N/A"}
          growth={""}
          icon="⚠️"
        />

        <StatsCard
          title="Recent Scans"
          value={loadingStats ? "Loading..." : Array.isArray(stats.recentScans) ? stats.recentScans.length : "N/A"}
          growth={""}
          icon="🌐"
        />

        <StatsCard
          title="AI Accuracy"
          value={loadingStats ? "Loading..." : stats.aiAccuracy != null ? `${stats.aiAccuracy}%` : "N/A"}
          growth={""}
          icon="🤖"
        />

      </section>

      {/* ANALYTICS */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

        {/* AREA CHART */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="xl:col-span-2 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-black">
                Analysis Activity
              </h2>

              <p className="text-white/40 mt-2">
                AI scanning performance overview
              </p>

            </div>

          </div>

          <div className="h-[350px]">

            <ResponsiveContainer width="100%" height={350}>

              <AreaChart data={stats.recentScans || analyticsData}>

                <defs>

                  <linearGradient
                    id="colorScans"
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
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey={Array.isArray(stats.recentScans) && stats.recentScans[0] && 'scans' in stats.recentScans[0] ? 'scans' : 'value'}
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorScans)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        {/* PIE CHART */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8"
        >

          <h2 className="text-3xl font-black mb-2">
            Risk Distribution
          </h2>

          <p className="text-white/40 mb-8">
            AI detected risk categories
          </p>

          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={stats.riskDistribution || riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >

                  {(stats.riskDistribution || riskDistribution).map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color ?? entry.colorHex ?? entry.fill ?? COLORS.primary}
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="space-y-4 mt-8">

            {(stats.riskDistribution || riskDistribution).map(
              (item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: item.color ?? item.colorHex ?? item.fill,
                      }}
                    />

                    <span className="text-white/70">
                      {item.name}
                    </span>

                  </div>

                  <span className="font-bold">
                    {item.value}%
                  </span>

                </div>
              )
            )}

          </div>

        </motion.div>

      </section>

      {/* RISK CARDS */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <RiskCard
          level="high"
          score="87"
          explanation="Detected aggressive data sharing clauses and hidden third-party tracking permissions."
        />

        <RiskCard
          level="medium"
          score="56"
          explanation="Cookie tracking permissions and marketing analytics clauses detected."
        />

        <RiskCard
          level="low"
          score="21"
          explanation="Policy appears relatively safe with minimal data exposure risks."
        />

      </section>

    </DashboardLayout>
  );
}

export default Dashboard;