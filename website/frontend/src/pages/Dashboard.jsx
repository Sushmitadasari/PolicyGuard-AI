import React, { useMemo, useState } from "react";
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
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useAnalytics } from "../context/AnalyticsContext";
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

const fallbackActivity = [
  { name: "Jan", scans: 120 },
  { name: "Feb", scans: 180 },
  { name: "Mar", scans: 240 },
  { name: "Apr", scans: 320 },
  { name: "May", scans: 390 },
  { name: "Jun", scans: 460 },
];

const fallbackRiskDistribution = [
  { name: "Safe", value: 68, color: COLORS.success },
  { name: "Warning", value: 22, color: COLORS.warning },
  { name: "Danger", value: 10, color: COLORS.danger },
];

const GRANULARITY_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getHistoryTimestamp = (item) =>
  item?.createdAt || item?.date || item?.metadata?.processedAt || null;

const getDisplayName = (item) => {
  const source = String(item?.source || "").toLowerCase();

  if (source === "website") {
    const url = item?.metadata?.url || "";
    if (url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (_err) {
        return url.replace(/^(https?:\/\/)?www\./, "").split("/")[0] || "Website";
      }
    }
    return "Website";
  }

  return item?.fileName || item?.documentName || "Analysis";
};

const formatShortDate = (value) => {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortTime = (value) => {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatRelativeTime = (value) => {
  const date = toDate(value);
  if (!date) return "-";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatShortDate(value);
};

const getWeekStart = (date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const offset = (day + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getBucketKey = (date, granularity) => {
  if (granularity === "day") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  if (granularity === "week") {
    const weekStart = getWeekStart(date);
    return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const sortChronologically = (a, b) => {
  const dateA = toDate(a?.dateKey || a?.name || a?.period);
  const dateB = toDate(b?.dateKey || b?.name || b?.period);
  if (!dateA || !dateB) return 0;
  return dateA - dateB;
};

const aggregateHistory = (records = [], granularity = "month") => {
  const sourceRecords = Array.isArray(records) ? records : [];
  const buckets = new Map();

  sourceRecords.forEach((item) => {
    const timestamp = getHistoryTimestamp(item);
    const date = toDate(timestamp);
    if (!date) return;

    const key = getBucketKey(date, granularity);
    if (!buckets.has(key)) {
      buckets.set(key, { name: key, scans: 0, dateKey: date.toISOString() });
    }

    const current = buckets.get(key);
    current.scans += 1;
  });

  return Array.from(buckets.values())
    .sort(sortChronologically)
    .slice(-12);
};

const buildRiskDistribution = (records = []) => {
  const sourceRecords = Array.isArray(records) ? records : [];
  const counts = { low: 0, medium: 0, high: 0 };

  sourceRecords.forEach((item) => {
    const score = Number(item?.riskScore ?? 0);
    const riskLevel = String(item?.riskLevel || "").toLowerCase();

    if (riskLevel.includes("high") || score >= 7) {
      counts.high += 1;
      return;
    }

    if (riskLevel.includes("medium") || score >= 4) {
      counts.medium += 1;
      return;
    }

    counts.low += 1;
  });

  return [
    { name: "Low", value: counts.low, color: COLORS.success },
    { name: "Medium", value: counts.medium, color: COLORS.warning },
    { name: "High", value: counts.high, color: COLORS.danger },
  ];
};

function Dashboard() {
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const [activityGranularity, setActivityGranularity] = useState("month");

  const loadingStats = analytics?.loading ?? true;
  const dashboardStats = analytics?.dashboardStats ?? {};
  const historyItems = Array.isArray(analytics?.historyItems) ? analytics.historyItems : [];
  const recentAnalyses = Array.isArray(analytics?.recentAnalyses) && analytics.recentAnalyses.length
    ? analytics.recentAnalyses
    : historyItems.slice(0, 5);

  const activityData = useMemo(() => {
    const source = historyItems.length ? historyItems : recentAnalyses;
    const aggregated = aggregateHistory(source, activityGranularity);
    return aggregated.length ? aggregated : fallbackActivity;
  }, [activityGranularity, historyItems, recentAnalyses]);

  const riskDistributionData = useMemo(() => {
    const derived = buildRiskDistribution(historyItems.length ? historyItems : recentAnalyses);
    const total = derived.reduce((sum, item) => sum + item.value, 0) || 0;

    if (!total) {
      return fallbackRiskDistribution;
    }

    return derived.map((item) => ({
      ...item,
      value: item.value,
    }));
  }, [historyItems, recentAnalyses]);

  const totalAnalyses = dashboardStats?.totalAnalyses ?? historyItems.length ?? null;
  const averageRiskScore = historyItems.length
    ? Math.round(historyItems.reduce((sum, item) => sum + Number(item?.riskScore || 0), 0) / historyItems.length)
    : dashboardStats?.averageRiskScore ?? null;
  const averageConfidence = historyItems.length
    ? Math.round(historyItems.reduce((sum, item) => sum + Number(item?.confidence || 0), 0) / historyItems.length)
    : dashboardStats?.averageConfidence ?? null;

  const recentActivity = useMemo(() => {
    return [...historyItems]
      .sort((a, b) => {
        const dateA = toDate(getHistoryTimestamp(a));
        const dateB = toDate(getHistoryTimestamp(b));
        if (!dateA || !dateB) return 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [historyItems]);

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Security Dashboard"
        subtitle="Monitoring active legal and privacy risk intelligence."
      />

      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-linear-to-br from-blue-600/20 to-transparent p-10 mb-10">
        <div className="absolute top-0 right-0 w-75 h-75 bg-blue-500/10 blur-[120px]" />
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-5xl font-black leading-tight mb-6">
            Your <span className="text-blue-400">AI legal protection system</span> is fully active.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            PolicyGuard AI is continuously analyzing privacy policies, contracts, and terms & conditions to detect hidden legal and security risks.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/pdf-analyzer")}
              className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-600/20"
            >
              Upload PDF
            </button>
            <button
              onClick={() => navigate("/website-analyzer")}
              className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
            >
              Scan Website
            </button>
            <button
              onClick={() => navigate("/history")}
              className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
            >
              View History
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatsCard title="Total Analyses" value={loadingStats ? "Loading..." : totalAnalyses ?? "N/A"} growth="" icon="📄" />
        <StatsCard title="Average Risk" value={loadingStats ? "Loading..." : averageRiskScore != null ? `${averageRiskScore}/10` : "N/A"} growth="" icon="⚠️" />
        <StatsCard title="Average Confidence" value={loadingStats ? "Loading..." : averageConfidence != null ? `${averageConfidence}%` : "N/A"} growth="" icon="🤖" />
        <StatsCard title="Recent Uploads" value={loadingStats ? "Loading..." : recentAnalyses.length} growth="" icon="🌐" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        <motion.div whileHover={{ y: -4 }} className="xl:col-span-2 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black">Analysis Activity</h2>
              <p className="text-white/40 mt-2">Aggregated from MongoDB timestamps</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <AIStatusBadge status="Live" />
              <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
                {GRANULARITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setActivityGranularity(option.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activityGranularity === option.value ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="scans" stroke="#2563eb" fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8">
          <h2 className="text-3xl font-black mb-2">Risk Distribution</h2>
          <p className="text-white/40 mb-8">AI detected risk categories</p>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskDistributionData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color ?? COLORS.primary} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 mt-8">
            {riskDistributionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color ?? COLORS.primary }} />
                  <span className="text-white/70">{item.name}</span>
                </div>
                <span className="font-bold">{item.value} analyses</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8 mb-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black">Recent Activity</h2>
            <p className="text-white/40 mt-2">Latest analyses pulled from the history collection</p>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recentActivity.map((item) => {
            const displayName = getDisplayName(item);
            const source = String(item?.source || "").toLowerCase() === "website" ? "Website" : "PDF";
            return (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="text-white font-bold truncate">{displayName}</p>
                    <p className="text-white/40 text-sm mt-1">{source}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/15 text-blue-300 border border-blue-500/20">
                    {item.riskLevel || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                  <span>Risk Score</span>
                  <span className="font-bold text-white">{Number(item.riskScore ?? 0)}/10</span>
                </div>

                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Timestamp</span>
                  <span className="font-medium text-white/80">{formatRelativeTime(getHistoryTimestamp(item))}</span>
                </div>

                <div className="mt-4 text-xs text-white/35">
                  {formatShortDate(getHistoryTimestamp(item))} at {formatShortTime(getHistoryTimestamp(item))}
                </div>
              </div>
            );
          })}

          {!recentActivity.length && (
            <div className="col-span-full rounded-3xl border border-white/10 bg-black/20 p-6 text-white/50">
              No recent analyses yet.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RiskCard level="high" score="87" explanation="Detected aggressive data sharing clauses and hidden third-party tracking permissions." />
        <RiskCard level="medium" score="56" explanation="Cookie tracking permissions and marketing analytics clauses detected." />
        <RiskCard level="low" score="21" explanation="Policy appears relatively safe with minimal data exposure risks." />
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
