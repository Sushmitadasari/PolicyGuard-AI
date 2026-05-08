import React, { useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

import { motion } from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";

import StatsCard from "../components/common/StatsCard";

import EmptyState from "../components/common/EmptyState";

import Modal from "../components/common/Modal";

const HISTORY_DATA = [
  {
    id: 1,
    name: "Google Privacy Policy",
    type: "Web Analysis",
    risk: "82%",
    status: "Completed",
    confidence: "98%",
    date: "Today",
    summary:
      "AI detected extensive third-party tracking and behavioral analytics.",
  },
  {
    id: 2,
    name: "Employment_Contract.pdf",
    type: "Contract Review",
    risk: "91%",
    status: "Completed",
    confidence: "96%",
    date: "Yesterday",
    summary:
      "Liability limitations and automatic renewal clauses detected.",
  },
  {
    id: 3,
    name: "Spotify Terms",
    type: "Privacy Policy Scan",
    risk: "64%",
    status: "Processing",
    confidence: "88%",
    date: "2 days ago",
    summary:
      "AI identified moderate tracking behavior and data retention concerns.",
  },
  {
    id: 4,
    name: "NDA_Agreement.pdf",
    type: "PDF Analysis",
    risk: "24%",
    status: "Archived",
    confidence: "94%",
    date: "3 days ago",
    summary:
      "Low-risk document with minimal legal concerns detected.",
  },
];

const CHART_DATA = [
  { month: "Jan", value: 20 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 70 },
  { month: "May", value: 85 },
  { month: "Jun", value: 110 },
];

const RISK_CHART = [
  { name: "Low", value: 20 },
  { name: "Medium", value: 48 },
  { name: "High", value: 90 },
  { name: "Critical", value: 120 },
];

function History() {
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const filtered = HISTORY_DATA.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "All"
        ? true
        : item.status === filter;

    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>

      {/* HERO HEADER */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-10 mb-10">

        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">

          <div>

            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">

              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

              <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-black">
                AI History Center
              </span>

            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-5">
              Analysis History
            </h1>

            <p className="text-white/40 text-lg leading-relaxed max-w-3xl">
              Access, monitor, export, and manage all AI-generated policy scans, privacy audits, and contract analyses from one enterprise dashboard.
            </p>

          </div>

          <div className="flex flex-wrap gap-4">

            <button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-600/20">
              Export History
            </button>

            <button className="h-14 px-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-bold">
              AI Summary
            </button>

          </div>

        </div>

      </section>

      {/* SEARCH + FILTER */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-10">

        <div className="xl:col-span-3">

          <input
            type="text"
            placeholder="Search analysis history..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full h-16 rounded-[2rem] bg-white/[0.03] border border-white/10 px-6 outline-none focus:border-blue-500 text-white placeholder:text-white/30"
          />

        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="h-16 rounded-[2rem] bg-white/[0.03] border border-white/10 px-6 outline-none focus:border-blue-500 text-white"
        >

          <option className="bg-[#020617]">
            All
          </option>

          <option className="bg-[#020617]">
            Completed
          </option>

          <option className="bg-[#020617]">
            Processing
          </option>

          <option className="bg-[#020617]">
            Archived
          </option>

        </select>

      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <StatsCard
          title="Total Analyses"
          value="12,430"
          growth="+18%"
          icon="📂"
        />

        <StatsCard
          title="Risk Alerts"
          value="1,280"
          growth="+12%"
          icon="⚠️"
        />

        <StatsCard
          title="Archived Reports"
          value="580"
          growth="+5%"
          icon="🗂️"
        />

        <StatsCard
          title="AI Accuracy"
          value="98.9%"
          growth="+4%"
          icon="🤖"
        />

      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">

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
                Analysis Growth
              </h2>

              <p className="text-white/40 mt-2">
                Monthly AI scanning activity
              </p>

            </div>

            <div className="text-5xl">
              📈
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={CHART_DATA}>

                <defs>

                  <linearGradient
                    id="historyGradient"
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
                  dataKey="month"
                  stroke="#94a3b8"
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#historyGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        {/* BAR CHART */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-black">
                Risk Levels
              </h2>

              <p className="text-white/40 mt-2">
                AI-detected risk distribution
              </p>

            </div>

            <div className="text-5xl">
              ⚠️
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={RISK_CHART}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                />

                <YAxis hide />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

      </section>

      {/* TABLE */}
      <section className="rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl overflow-hidden">

        <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div>

            <h2 className="text-3xl font-black">
              Recent Analyses
            </h2>

            <p className="text-white/40 mt-2">
              Enterprise AI monitoring activity logs
            </p>

          </div>

          <button className="h-14 px-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-bold">
            Download Logs
          </button>

        </div>

        {filtered.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="No Analysis Found"
            subtitle="Try changing your search query."
          />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead>

                <tr className="text-left border-b border-white/5 text-white/40 text-sm uppercase tracking-[0.2em]">

                  <th className="p-6">
                    Document
                  </th>

                  <th className="p-6">
                    Type
                  </th>

                  <th className="p-6">
                    Risk
                  </th>

                  <th className="p-6">
                    Status
                  </th>

                  <th className="p-6">
                    Confidence
                  </th>

                  <th className="p-6">
                    Date
                  </th>

                  <th className="p-6">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filtered.map((item) => (

                  <motion.tr
                    key={item.id}
                    whileHover={{
                      backgroundColor:
                        "rgba(255,255,255,0.03)",
                    }}
                    className="border-b border-white/5 transition-all"
                  >

                    <td className="p-6">

                      <div>

                        <h3 className="font-bold text-lg">
                          {item.name}
                        </h3>

                        <p className="text-white/40 text-sm mt-2 max-w-md">
                          {item.summary}
                        </p>

                      </div>

                    </td>

                    <td className="p-6 text-white/60">
                      {item.type}
                    </td>

                    <td className="p-6">

                      <div className="inline-flex px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                        {item.risk}
                      </div>

                    </td>

                    <td className="p-6">

                      <div className="inline-flex px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                        {item.status}
                      </div>

                    </td>

                    <td className="p-6 text-green-400 font-bold">
                      {item.confidence}
                    </td>

                    <td className="p-6 text-white/40">
                      {item.date}
                    </td>

                    <td className="p-6">

                      <div className="flex gap-3">

                        <button
                          onClick={() =>
                            setSelected(item)
                          }
                          className="px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all font-semibold text-blue-400"
                        >
                          View
                        </button>

                        <button className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-semibold">
                          Export
                        </button>

                      </div>

                    </td>

                  </motion.tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* MODAL */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
      >

        {selected && (

          <div>

            <div className="flex items-start justify-between mb-8">

              <div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5">

                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

                  <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-black">
                    AI Analysis Detail
                  </span>

                </div>

                <h2 className="text-4xl font-black mb-4">
                  {selected.name}
                </h2>

                <p className="text-white/40">
                  {selected.summary}
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">

                <p className="text-white/40 text-sm mb-3">
                  Risk Score
                </p>

                <h3 className="text-4xl font-black text-red-400">
                  {selected.risk}
                </h3>

              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">

                <p className="text-white/40 text-sm mb-3">
                  AI Confidence
                </p>

                <h3 className="text-4xl font-black text-green-400">
                  {selected.confidence}
                </h3>

              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">

                <p className="text-white/40 text-sm mb-3">
                  Status
                </p>

                <h3 className="text-4xl font-black text-blue-400">
                  {selected.status}
                </h3>

              </div>

            </div>

            <div className="flex flex-wrap gap-4">

              <button className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold">
                Download Report
              </button>

              <button className="px-7 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-bold">
                Share Analysis
              </button>

            </div>

          </div>

        )}

      </Modal>

    </DashboardLayout>
  );
}

export default History;