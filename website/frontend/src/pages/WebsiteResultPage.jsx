import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";
import api from "../services/api";
import { useAnalytics } from "../context/AnalyticsContext";

export default function WebsiteResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const analysis =
    location.state?.analysis ??
    location.state?.data?.analysis ??
    location.state?.data ??
    analytics?.latestAnalyses?.website ??
    location.state ??
    null;

  if (!analysis) {
    return (
      <DashboardLayout>
        <PageHeader title="Website Analysis Result" subtitle="No data available" />
        <div className="rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl p-10 text-center">
          <h3 className="text-3xl font-black mb-4">No analysis data found</h3>
          <p className="text-white/60 mb-8">Analyze a website first to see results here.</p>
          <button
            onClick={() => navigate('/website-analyzer')}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            Back to Analyzer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const summary = analysis?.summary ?? analysis?.executiveSummary ?? "";
  const riskScore = Number(analysis?.riskScore ?? analysis?.risk_score ?? 0);
  const confidence = Number(analysis?.confidence ?? 0);
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  const clauses = Array.isArray(analysis?.clauses) ? analysis.clauses : [];

  // Helpers - normalize and detect severity
  const normalizeSeverity = (value) => {
    if (!value) return "Low";
    const text = String(value).toLowerCase();
    if (text.includes("critical")) return "Critical";
    if (text.includes("high")) return "High";
    if (text.includes("medium")) return "Medium";
    return "Low";
  };

  const detectSeverityFromContent = (title, description) => {
    const content = `${title} ${description}`.toLowerCase();
    const high = ["tracking", "third-party", "sharing", "financial", "biometric", "location"];
    const medium = ["cookie", "analytics", "retention", "marketing"];
    if (high.some((k) => content.includes(k))) return "High";
    if (medium.some((k) => content.includes(k))) return "Medium";
    return "Low";
  };

  // Normalize clause types to human titles
  const normalizeClauseType = (rawType) => {
    const map = {
      "data-sharing": "Third-Party Data Sharing",
      "third-party": "Third-Party Data Sharing",
      tracking: "User Tracking & Monitoring",
      retention: "Data Retention Policy",
      cookies: "Cookie Usage & Tracking",
      "auto-renewal": "Automatic Renewal Terms",
      liability: "Liability Waiver",
    };
    const t = String(rawType ?? "").toLowerCase();
    for (const key of Object.keys(map)) if (t.includes(key)) return map[key];
    return String(rawType ?? "").replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()).trim();
  };

  const getClauseDescription = (title) => {
    const map = {
      "Third-Party Data Sharing": "This website may share user information with advertisers or external partners.",
      "User Tracking & Monitoring": "User activity and behavior may be tracked for analytics or advertising.",
      "Data Retention Policy": "Data may be stored for extended periods; check deletion policies.",
      "Cookie Usage & Tracking": "Cookies and trackers may monitor users across sessions and sites.",
      "Automatic Renewal Terms": "Services may renew automatically unless cancelled.",
      "Liability Waiver": "The site may limit liability for damages or losses.",
    };
    return map[title] || "This clause contains terms that may affect user privacy or rights. Review carefully.";
  };

  // Deduplicate risks and clauses
  const deduplicateRisks = (arr) => {
    const seen = new Set();
    return arr
      .map((r) => ({
        title: String(r?.title ?? r?.risk ?? r?.name ?? "").trim(),
        description: r?.description ?? r?.details ?? r?.explanation ?? "",
        severity: normalizeSeverity(r?.severity ?? r?.level ?? r?.riskLevel ?? detectSeverityFromContent(r?.title ?? r?.risk ?? "", r?.description ?? "")),
      }))
      .filter((r) => {
        const key = (r.title + '|' + r.description).toLowerCase().replace(/\s+/g, ' ').trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  };

  const deduplicateClauses = (arr) => {
    const seen = new Set();
    return arr
      .map((c) => ({
        rawType: c?.type ?? c?.title ?? c?.clause ?? "Clause",
        title: normalizeClauseType(c?.type ?? c?.title ?? c?.clause ?? "Clause"),
        description: c?.explanation ?? c?.description ?? c?.whyRisky ?? getClauseDescription(normalizeClauseType(c?.type ?? c?.title ?? c?.clause ?? "Clause")),
      }))
      .filter((c) => {
        const key = (String(c.title) + '|' + String(c.description)).toLowerCase().replace(/\s+/g, ' ').trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  };

  const dedupRisks = deduplicateRisks(risks);
  const dedupClauses = deduplicateClauses(clauses);

  // Dynamic recommendations from detected risks
  const generateRecommendationsFromRisks = (riskList) => {
    const recs = new Set();
    riskList.forEach((r) => {
      const t = (r.title ?? '').toLowerCase();
      if (t.includes('track') || t.includes('analytics') || t.includes('cookie')) {
        recs.add('Disable unnecessary analytics and tracking scripts.');
      }
      if (t.includes('third') || t.includes('share') || t.includes('advert')) {
        recs.add('Review third-party data sharing and vendor agreements.');
      }
      if (t.includes('retain') || t.includes('retention')) {
        recs.add('Define clear retention and deletion policies for user data.');
      }
      if (t.includes('payment') || t.includes('financial')) {
        recs.add('Ensure payment data is encrypted and access-controlled.');
      }
      if (t.includes('biometric') || t.includes('location')) {
        recs.add('Treat sensitive data with strict consent and limited retention.');
      }
    });
    if (recs.size === 0) recs.add('Review privacy policy and ensure clear, user-friendly disclosures.');
    return Array.from(recs);
  };

  const dynamicRecommendations = generateRecommendationsFromRisks(dedupRisks);

  // Chat assistant state
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: "Hi — I'm the AI Website Privacy Assistant. Ask me about the detected risks or clauses.", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const sessionId = useRef(`ws-${Date.now()}`);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;
    const userMsg = { id: messages.length + 1, type: 'user', text, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInputValue('');
    setChatLoading(true);
    try {
      const payload = {
        message: text,
        sessionId: sessionId.current,
        context: {
          summary,
          risks: dedupRisks,
          clauses: dedupClauses,
          url: analysis?.url ?? analysis?.source ?? null,
        },
      };
      const res = await api.post('/chatbot/chat', payload);
      const aiText = res.data?.reply ?? res.data?.message ?? res.data?.response ?? 'I can help with that.';
      const aiMsg = { id: messages.length + 2, type: 'ai', text: aiText, timestamp: new Date() };
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      const errMsg = { id: messages.length + 2, type: 'ai', text: err?.response?.data?.message || 'Error contacting AI. Try again later.', timestamp: new Date(), isError: true };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const recommendations = Array.isArray(analysis?.recommendations) && analysis.recommendations.length
    ? Array.from(new Set([...analysis.recommendations, ...dynamicRecommendations]))
    : dynamicRecommendations;

  return (
    <DashboardLayout>
      <PageHeader title="Website Analysis Result" subtitle="AI-driven privacy and risk insights" />

      <section className="rounded-[3rem] border border-white/10 bg-linear-to-br from-blue-600/20 to-transparent p-10 mb-10">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <p className="text-white/40 text-sm uppercase tracking-wider mb-3">Risk Score</p>
            <h2 className="text-5xl font-black text-red-400">{riskScore}%</h2>
            <p className="text-white/60 mt-2">Confidence: {confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100)}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
            <p className="text-white/40 uppercase tracking-wider text-sm mb-3">Executive Summary</p>
            <div className="rounded-2xl bg-white/5 p-6 text-white/80">{summary || "No executive summary provided."}</div>
          </motion.div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-3xl font-black mb-2">Detected Risks ({dedupRisks.length})</h3>
        <p className="text-white/60 mb-6">Unique, actionable risk findings extracted from the website.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dedupRisks.length === 0 && <p className="text-white/60">No risks detected.</p>}
          {dedupRisks.map((r, i) => {
            const tone = r.severity === 'High' ? { badge: 'bg-red-500/20 text-red-300 border-red-500/30', glow: 'shadow-red-500/20' } : r.severity === 'Medium' ? { badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', glow: 'shadow-yellow-500/20' } : { badge: 'bg-green-500/20 text-green-300 border-green-500/30', glow: 'shadow-green-500/20' };
            const icon = r.severity === 'High' ? '⚠️' : r.severity === 'Medium' ? '🔶' : '✅';
            return (
              <motion.div key={`wrisk-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`rounded-3xl border border-white/10 bg-white/3 p-6 hover:border-white/20 ${tone.glow} transition-all`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{icon}</div>
                      <h4 className="font-bold text-lg">{r.title || 'Detected Risk'}</h4>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{r.description || 'No description provided.'}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${tone.badge}`}>{r.severity} Risk</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-3xl font-black mb-2">Detected Clauses ({dedupClauses.length})</h3>
        <p className="text-white/60 mb-6">Grouped policy clauses with clean explanations.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dedupClauses.length === 0 && <p className="text-white/60">No clauses detected.</p>}
          {dedupClauses.map((c, i) => (
            <motion.div key={`wclause-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-3xl border border-white/10 bg-white/3 p-6 hover:border-white/20 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg">{c.title}</h4>
                <span className="text-xs text-white/40">Clause</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{c.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="rounded-[3rem] border border-white/10 bg-white/3 p-10 mb-10">
        <h3 className="text-3xl font-black mb-6">Recommendations</h3>
        <ul className="list-disc pl-6 text-white/70">
          {recommendations.map((rec, idx) => (
            <li key={`rec-${idx}`} className="mb-3">{rec}</li>
          ))}
        </ul>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
        <button
          onClick={() => navigate("/website-analyzer")}
          className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
        >
          Analyze Another Website
        </button>
        <button
          onClick={() => window.print()}
          className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
        >
          Download Report
        </button>
        <button
          onClick={() =>
            navigate("/website-chat", {
              state: {
                websiteAnalysis: analysis,
              },
            })
          }
          className="px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all"
        >
          Ask AI About This Website
        </button>
      </div>

    </DashboardLayout>
  );
}
