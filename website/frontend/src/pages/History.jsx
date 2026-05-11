import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import historyService from "../services/historyService";
import { useAnalytics } from "../context/AnalyticsContext";
import { notifyAnalyticsChanged } from "../utils/analyticsEvents";

const HISTORY_DATA = [];

const getDisplayName = (item) => {
  const source = (item.source || "").toLowerCase();

  if (source === "pdf") {
    const fileName = item.fileName || item.documentName || "";
    if (fileName.trim()) {
      return fileName;
    }
  }

  if (source === "website") {
    const url = item.metadata?.url || "";
    if (url.trim()) {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (_err) {
        return url.replace(/^(https?:\/\/)?www\./, "").split("/")[0] || "Website";
      }
    }
  }

  return item.fileName || item.documentName || "Analysis";
};

const getDocumentType = (item) => {
  const source = (item.source || "").toLowerCase();
  if (source === "pdf") return "PDF";
  if (source === "website") return "Website";
  return item.analysisType || "Analysis";
};

const getSummaryPreview = (summary, maxLength = 60) => {
  if (!summary) return "-";
  return summary.length > maxLength ? `${summary.substring(0, maxLength)}...` : summary;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function History() {
  const analytics = useAnalytics();
  const [selected, setSelected] = useState(null);
  const [histories, setHistories] = useState(HISTORY_DATA);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const loading = analytics?.loading ?? false;

  const filtered = histories.filter((item) => {
    const name = getDisplayName(item).toLowerCase();
    const summary = (item.summary || "").toLowerCase();
    const matchSearch = `${name} ${summary}`.includes(search.toLowerCase());

    const itemType = getDocumentType(item);
    const matchFilter = filter === "All" ? true : itemType === filter;

    return matchSearch && matchFilter;
  });

  useEffect(() => {
    const items = Array.isArray(analytics?.historyItems)
      ? analytics.historyItems.map((it) => ({
          id: it.id,
          fileName: it.fileName,
          documentName: it.documentName,
          source: it.source,
          analysisType: it.analysisType,
          summary: it.summary,
          risk: it.riskScore != null ? `${Math.round(it.riskScore)}%` : "N/A",
          riskLevel: it.riskLevel || "Unknown",
          confidence: it.confidence != null ? `${it.confidence}%` : "-",
          date: it.createdAt || null,
          metadata: it.metadata || {},
        }))
      : [];

    setHistories(items);
  }, [analytics?.historyItems]);

  const handleDelete = (id) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const id = confirmTarget;
    if (!id) return;

    setDeletingId(id);
    try {
      await historyService.deleteHistoryItem(id);
      setHistories((prev) => prev.filter((it) => it.id !== id));
      setConfirmOpen(false);
      setConfirmTarget(null);
      notifyAnalyticsChanged();
    } catch (err) {
      console.error("Failed to delete history item", err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-10 mb-10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[120px]" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-black">AI History Center</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-5">Analysis History</h1>
            <p className="text-white/40 text-lg leading-relaxed max-w-3xl">
              Access, monitor, and manage all AI-generated policy scans, privacy audits, and contract analyses.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-3">
          <input
            type="text"
            placeholder="Search analysis history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-5 outline-none focus:border-blue-500 text-white placeholder:text-white/30"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-14 rounded-2xl bg-white/[0.03] border border-white/10 px-5 outline-none focus:border-blue-500 text-white"
        >
          <option className="bg-[#020617]">All</option>
          <option className="bg-[#020617]">PDF</option>
          <option className="bg-[#020617]">Website</option>
        </select>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-2xl font-black">Recent Analyses</h2>
          <p className="text-white/40 mt-1">Enterprise AI monitoring activity logs</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-white/50">Loading history...</div>
        ) : filtered.length === 0 ? (
          <EmptyState emoji="📭" title="No Analysis Found" subtitle="Try changing your search query." />
        ) : (
          <>
            <div className="hidden md:block p-4 overflow-x-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left border-b border-white/5 text-white/40 text-xs uppercase tracking-[0.15em]">
                    <th className="p-3 w-[40%]">Document</th>
                    <th className="p-3 w-[10%]">Type</th>
                    <th className="p-3 w-[10%]">Risk</th>
                    <th className="p-3 w-[12%]">Confidence</th>
                    <th className="p-3 w-[14%]">Date</th>
                    <th className="p-3 w-[14%] text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => (
                    <motion.tr
                      key={item.id}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="border-b border-white/5 transition-all"
                    >
                      <td className="p-3 align-top">
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{getDisplayName(item)}</p>
                          <p className="text-white/40 text-xs truncate mt-1">{getSummaryPreview(item.summary, 70)}</p>
                        </div>
                      </td>

                      <td className="p-3 text-white/70 text-sm">{getDocumentType(item)}</td>

                      <td className="p-3">
                        <span className="inline-flex px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs">
                          {item.risk}
                        </span>
                      </td>

                      <td className="p-3 text-green-400 font-bold text-xs">{item.confidence}</td>

                      <td className="p-3 text-white/40 text-xs whitespace-nowrap">{formatDate(item.date)}</td>

                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelected(item)}
                            className="px-2.5 py-1 rounded-md bg-blue-600/20 border border-blue-600/30 hover:bg-blue-600/25 text-xs font-semibold text-blue-300"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="px-2.5 py-1 rounded-md bg-red-600/10 border border-red-600/20 hover:bg-red-600/15 text-xs font-semibold text-red-400 disabled:opacity-50"
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3 p-3">
              {filtered.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{getDisplayName(item)}</p>
                      <p className="text-white/40 text-xs mt-1 truncate">{getSummaryPreview(item.summary, 60)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white/60 text-xs">{getDocumentType(item)}</p>
                      <p className="text-white/40 text-xs">{formatDate(item.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs">
                      Risk: {item.risk}
                    </span>
                    <span className="inline-flex px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs">
                      Conf: {item.confidence}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(item)}
                      className="flex-1 px-2 py-1.5 rounded-md bg-blue-600/20 border border-blue-600/30 hover:bg-blue-600/25 text-xs font-semibold text-blue-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="flex-1 px-2 py-1.5 rounded-md bg-red-600/10 border border-red-600/20 hover:bg-red-600/15 text-xs font-semibold text-red-400 disabled:opacity-50"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <Modal open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <h2 className="text-3xl font-black mb-3">{getDisplayName(selected)}</h2>
            <p className="text-white/50 mb-6">{selected.summary || "No summary available."}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
                <p className="text-white/40 text-sm">Risk Score</p>
                <p className="text-3xl font-black text-red-400 mt-1">{selected.risk}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
                <p className="text-white/40 text-sm">Confidence</p>
                <p className="text-3xl font-black text-green-400 mt-1">{selected.confidence}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
                <p className="text-white/40 text-sm">Type</p>
                <p className="text-3xl font-black text-blue-400 mt-1">{getDocumentType(selected)}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmTarget(selected.id);
                setConfirmOpen(true);
                setSelected(null);
              }}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-all font-bold"
            >
              Delete
            </button>
          </div>
        )}
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="p-4">
          <h3 className="text-2xl font-black mb-3">Delete Analysis</h3>
          <p className="text-white/60 mb-6">Are you sure you want to delete this analysis? This action cannot be undone.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-5 py-2 rounded-md bg-white/[0.03] border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={!!deletingId}
              className="px-5 py-2 rounded-md bg-red-600 text-white disabled:opacity-50"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default History;
