import { useEffect, useState } from "react"

const defaultState = {
  summary: "Open a privacy or terms page to run a quick scan.",
  riskScore: "--",
  riskLevel: "--",
  confidence: "--",
  topRisks: [],
  url: "",
  title: "PolicyGuard-AI",
};

const Popup = () => {
  const [analysis, setAnalysis] = useState(defaultState)

  useEffect(() => {
    chrome.storage.local.get(["policyguardLatestAnalysis", "policyguardLatestAnalysisError"], (result) => {
      const latest = result?.policyguardLatestAnalysis || {}

      if (latest && latest.success) {
        setAnalysis({
          summary: latest.summary || defaultState.summary,
          riskScore: latest.riskScore ?? latest.riskScoreNormalized ?? "--",
          riskLevel: latest.riskLevel || "--",
          confidence: latest.confidence ?? "--",
          topRisks: Array.isArray(latest.topRisks) ? latest.topRisks : [],
          url: latest.metadata?.currentUrl || latest.metadata?.url || "",
          title: latest.metadata?.pageTitle || latest.metadata?.title || "Live scan",
        })
        return
      }

      if (result?.policyguardLatestAnalysisError) {
        setAnalysis((current) => ({
          ...current,
          summary: result.policyguardLatestAnalysisError,
        }))
      }
    })
  }, [])

  const openDashboard = () => {
    chrome.tabs.create({ url: "http://localhost:5173/dashboard" })
  }

  return (
    <div className="min-h-screen w-[392px] bg-slate-950 text-slate-100 p-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-red-300/80">PolicyGuard-AI</div>
            <h1 className="mt-2 text-xl font-black leading-tight">Live privacy intelligence</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {analysis.title}
            </p>
          </div>

          <button
            onClick={openDashboard}
            className="rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/25"
          >
            Open Dashboard
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Risk Score</div>
            <div className="mt-2 text-2xl font-black text-white">{analysis.riskScore}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Risk Level</div>
            <div className="mt-2 text-lg font-black text-white">{analysis.riskLevel}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Confidence</div>
            <div className="mt-2 text-lg font-black text-white">{analysis.confidence}%</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Quick Summary</div>
          <p className="mt-2 text-sm leading-6 text-slate-200">{analysis.summary}</p>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Top Risks</div>
          <div className="mt-3 space-y-2">
            {analysis.topRisks.length > 0 ? analysis.topRisks.map((risk, index) => (
              <div key={`${risk.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                {risk.title}
              </div>
            )) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
                No risks available yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={openDashboard}
            className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600"
          >
            Deep Analysis
          </button>
          <button
            onClick={() => chrome.runtime.sendMessage({ type: "OPEN_EXTENSION" })}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Open App
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Deep Analysis opens the main SaaS dashboard. Extension scans stay lightweight and use the centralized backend only.
        </p>
      </div>
    </div>
  )
}

export default Popup;