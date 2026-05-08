import React, {
  useState,
} from "react";

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
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";

import StatsCard from "../components/common/StatsCard";

import AIStatusBadge from "../components/common/AIStatusBadge";

const reports = [
  {
    id: 1,
    name: "Google_Privacy_Audit",
    type: "Website Scan",
    date: "Today",
    risk: "High",
    format: "PDF",
    confidence: "98%",
    status: "Generated",
    summary:
      "AI detected extensive third-party tracking, behavioral analytics, and hidden data sharing.",
  },
  {
    id: 2,
    name:
      "Employment_Contract_Review",
    type: "Contract Review",
    date: "Yesterday",
    risk: "Critical",
    format: "DOCX",
    confidence: "96%",
    status: "Exported",
    summary:
      "Automatic renewal clauses and liability limitations identified.",
  },
  {
    id: 3,
    name:
      "Spotify_Privacy_Report",
    type:
      "Privacy Policy Audit",
    date: "2 days ago",
    risk: "Medium",
    format: "JSON",
    confidence: "92%",
    status: "Generated",
    summary:
      "Moderate tracking and data retention practices detected.",
  },
];

const trendData = [
  { month: "Jan", value: 20 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 60 },
  { month: "Apr", value: 90 },
  { month: "May", value: 120 },
  { month: "Jun", value: 160 },
];

const categoryData = [
  {
    name: "Contracts",
    value: 80,
  },
  {
    name: "Web",
    value: 65,
  },
  {
    name: "Privacy",
    value: 95,
  },
  {
    name: "Policies",
    value: 50,
  },
];

const pieData = [
  {
    name: "High",
    value: 45,
  },
  {
    name: "Medium",
    value: 30,
  },
  {
    name: "Low",
    value: 25,
  },
];

function Report() {
  const [selected,
    setSelected] =
    useState(null);

  const [search,
    setSearch] =
    useState("");

  const [selectedTab,
    setSelectedTab] =
    useState("reports");

  const filteredReports =
    reports.filter((item) =>
      item.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const handleDownload = (
    name
  ) => {
    alert(
      `Downloading ${name} report...`
    );
  };

  const handleShare = () => {
    alert("Share link copied!");
  };

  const handleDelete = () => {
    alert("Report deleted.");
  };

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}
      <PageHeader
        title="AI Reports Center"
        subtitle="Generate, manage, export, and monitor enterprise AI-powered legal intelligence reports."
        actionButton={
          <div className="flex gap-4">

            <button className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-600/20">
              Generate Report
            </button>

            <button className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-bold">
              Export Analytics
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
                ENTERPRISE REPORTING ENGINE
              </span>

            </div>

            <h2 className="text-5xl font-black leading-tight mb-6 max-w-4xl">
              AI-powered legal intelligence reporting system.
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
              Generate advanced risk reports, privacy audits, legal summaries, compliance insights, and AI-powered analytics for contracts, websites, and policies.
            </p>

          </div>

          <AIStatusBadge status="Active" />

        </div>

      </section>

      {/* QUICK STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <StatsCard
          title="Reports Generated"
          value="8.2K"
          growth="+18%"
          icon="📊"
        />

        <StatsCard
          title="AI Accuracy"
          value="98.9%"
          growth="+6%"
          icon="🤖"
        />

        <StatsCard
          title="Critical Risks"
          value="1.2K"
          growth="+12%"
          icon="⚠️"
        />

        <StatsCard
          title="Compliance Passed"
          value="74%"
          growth="+9%"
          icon="🛡️"
        />

      </section>

      {/* SEARCH */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl mb-10">

        <div className="flex flex-col xl:flex-row gap-6">

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="flex-1 h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/30"
          />

          <button className="h-16 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold">
            Search Reports
          </button>

        </div>

      </section>

      {/* TABS */}
      <section className="flex flex-wrap gap-4 mb-10">

        {[
          "reports",
          "analytics",
          "exports",
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
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">

        {/* AREA */}
        <motion.div
          whileHover={{
            y: -4,
          }}
          className="xl:col-span-2 bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl"
        >

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-3xl font-black">
                Report Generation Trends
              </h3>

              <p className="text-white/40 mt-2">
                AI report activity over time
              </p>

            </div>

            <div className="text-5xl">
              📈
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={trendData}>

                <defs>

                  <linearGradient
                    id="colorGradient"
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
                  stroke="#64748b"
                />

                <YAxis
                  stroke="#64748b"
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

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
                Risk Levels
              </h3>

              <p className="text-white/40 mt-2">
                AI-generated severity metrics
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
                  data={pieData}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={5}
                >

                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#22c55e" />

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

      </section>

      {/* CATEGORY CHART */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl mb-10">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h3 className="text-3xl font-black">
              Report Categories
            </h3>

            <p className="text-white/40 mt-2">
              Distribution of generated AI reports
            </p>

          </div>

          <div className="text-5xl">
            📂
          </div>

        </div>

        <div className="h-[320px]">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart data={categoryData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff08"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#64748b"
              />

              <YAxis hide />

              <Tooltip />

              <Bar
                dataKey="value"
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

      {/* REPORT TABLE */}
      <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl overflow-x-auto">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h2 className="text-4xl font-black mb-3">
              Generated Reports
            </h2>

            <p className="text-white/40">
              AI-generated legal and privacy reports.
            </p>

          </div>

          <button className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold">
            Create Report
          </button>

        </div>

        <table className="w-full min-w-[1100px]">

          <thead>

            <tr className="border-b border-white/5 text-left text-white/50 uppercase tracking-[0.2em] text-xs">

              <th className="pb-5">
                Report
              </th>

              <th className="pb-5">
                Type
              </th>

              <th className="pb-5">
                Risk
              </th>

              <th className="pb-5">
                Confidence
              </th>

              <th className="pb-5">
                Status
              </th>

              <th className="pb-5">
                Date
              </th>

              <th className="pb-5">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredReports.map(
              (item) => (

                <motion.tr
                  key={item.id}
                  whileHover={{
                    backgroundColor:
                      "rgba(255,255,255,0.03)",
                  }}
                  className="border-b border-white/[0.03]"
                >

                  <td className="py-6 pr-6">

                    <div>

                      <h3 className="font-bold text-lg">
                        {item.name}
                      </h3>

                      <p className="text-white/40 text-sm mt-2 max-w-md">
                        {item.summary}
                      </p>

                    </div>

                  </td>

                  <td className="py-6">
                    {item.type}
                  </td>

                  <td className="py-6">

                    <div className="inline-flex px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-[0.2em]">

                      {item.risk}

                    </div>

                  </td>

                  <td className="py-6 text-green-400 font-bold">
                    {item.confidence}
                  </td>

                  <td className="py-6">

                    <div className="inline-flex px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">

                      {item.status}

                    </div>

                  </td>

                  <td className="py-6 text-white/40">
                    {item.date}
                  </td>

                  <td className="py-6">

                    <div className="flex flex-wrap gap-3">

                      <button
                        onClick={() =>
                          setSelected(
                            item
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleDownload(
                            item.name
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                      >
                        Download
                      </button>

                      <button
                        onClick={
                          handleShare
                        }
                        className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                      >
                        Share
                      </button>

                      <button
                        onClick={
                          handleDelete
                        }
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </motion.tr>

              )
            )}

          </tbody>

        </table>

      </section>

      {/* MODAL */}
      <AnimatePresence>

        {selected && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
          >

            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
              }}
              className="w-full max-w-3xl rounded-[3rem] border border-white/10 bg-[#0f172a] p-10"
            >

              <div className="flex items-start justify-between mb-8">

                <div>

                  <h2 className="text-4xl font-black mb-4">
                    {selected.name}
                  </h2>

                  <p className="text-white/40">
                    {selected.summary}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelected(
                      null
                    )
                  }
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  ✕
                </button>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                  <p className="text-white/40 text-sm mb-3">
                    Risk Level
                  </p>

                  <h3 className="text-3xl font-black text-red-400">
                    {selected.risk}
                  </h3>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                  <p className="text-white/40 text-sm mb-3">
                    AI Confidence
                  </p>

                  <h3 className="text-3xl font-black text-green-400">
                    {selected.confidence}
                  </h3>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                  <p className="text-white/40 text-sm mb-3">
                    Format
                  </p>

                  <h3 className="text-3xl font-black text-blue-400">
                    {selected.format}
                  </h3>

                </div>

              </div>

              <div className="flex flex-wrap gap-4">

                <button
                  onClick={() =>
                    handleDownload(
                      selected.name
                    )
                  }
                  className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold"
                >
                  Download Report
                </button>

                <button
                  onClick={
                    handleShare
                  }
                  className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold"
                >
                  Share Report
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </DashboardLayout>
  );
}

export default Report;