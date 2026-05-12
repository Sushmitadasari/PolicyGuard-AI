console.log("POLICYGUARD AI CONTENT SCRIPT ACTIVE");

const DETECTION_KEYWORDS = [
  "privacy",
  "privacy-policy",
  "privacy policy",
  "terms",
  "terms-of-service",
  "terms-and-conditions",
  "cookies",
  "cookie-policy",
  "legal",
  "gdpr",
  "security",
  "data-policy",
];

const BANNER_ID = "policyguard-banner";
const MAX_SNIPPET_LENGTH = 2500;
const LOGO_SRC = chrome.runtime.getURL("policyguard-logo.png");

const isPrivacyPage = () => {
  const currentUrl = window.location.href.toLowerCase();
  const title = (document.title || "").toLowerCase();

  if (DETECTION_KEYWORDS.some((keyword) => currentUrl.includes(keyword) || title.includes(keyword))) {
    return true;
  }

  const links = [...document.querySelectorAll("a")];
  const matchedLinks = links.filter((link) => {
    const text = (link.innerText || "").toLowerCase();
    const href = (link.href || "").toLowerCase();
    return DETECTION_KEYWORDS.some((keyword) => text.includes(keyword) || href.includes(keyword));
  });

  return matchedLinks.length > 0;
};

const extractPolicySnippet = () => {
  const parts = [];
  const normalizedTitle = (document.title || "").trim();

  if (normalizedTitle) {
    parts.push(`Title: ${normalizedTitle}`);
  }

  const metaDescription = document.querySelector('meta[name="description"]')?.content?.trim();
  if (metaDescription) {
    parts.push(`Description: ${metaDescription}`);
  }

  const headings = [...document.querySelectorAll('h1, h2, h3')]
    .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4);

  if (headings.length > 0) {
    parts.push(`Headings: ${headings.join(' | ')}`);
  }

  const paragraphs = [...document.querySelectorAll('p, li')]
    .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 10);

  if (paragraphs.length > 0) {
    parts.push(`Text: ${paragraphs.join(' ')}`);
  }

  const combined = parts.join('\n\n').trim();
  return combined.slice(0, MAX_SNIPPET_LENGTH);
};

const getRiskTone = (riskLevel = "") => {
  const normalized = String(riskLevel).toUpperCase();

  if (normalized === "HIGH") {
    return {
      ring: "border-red-500/35",
      pill: "bg-red-500/15 text-red-200 border-red-500/30",
      accent: "bg-gradient-to-r from-red-950 via-red-900 to-red-800",
    };
  }

  if (normalized === "MEDIUM") {
    return {
      ring: "border-amber-500/35",
      pill: "bg-amber-500/15 text-amber-200 border-amber-500/30",
      accent: "bg-gradient-to-r from-amber-950 via-amber-900 to-orange-900",
    };
  }

  return {
    ring: "border-emerald-500/35",
    pill: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    accent: "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800",
  };
};

const buildAnalysisUrl = () => {
  const target = new URL("http://localhost:5173/website-analyzer");
  target.searchParams.set("url", window.location.href);
  return target.toString();
};

const createBanner = () => {
  if (document.getElementById(BANNER_ID)) {
    return;
  }

  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.innerHTML = `
    <div class="policyguard-shell">
      <div class="policyguard-brand">
        <img class="policyguard-logo" src="${LOGO_SRC}" alt="PolicyGuard" />
        <div class="policyguard-copy">
          <div class="policyguard-eyebrow">PolicyGuard-AI</div>
          <div class="policyguard-title">Analyzing this policy page</div>
          <div class="policyguard-summary" data-role="summary">Quick scan in progress...</div>
        </div>
      </div>

      <div class="policyguard-metrics">
        <div class="policyguard-metric">
          <span>Risk Score</span>
          <strong data-role="riskScore">--</strong>
        </div>
        <div class="policyguard-metric">
          <span>Risk Level</span>
          <strong data-role="riskLevel">--</strong>
        </div>
        <div class="policyguard-metric">
          <span>Confidence</span>
          <strong data-role="confidence">--</strong>
        </div>
      </div>

      <div class="policyguard-risks" data-role="risks"></div>

      <div class="policyguard-actions">
        <button class="policyguard-button policyguard-primary" data-role="deepAnalysis">Deep Analysis</button>
        <button class="policyguard-button policyguard-secondary" data-role="close">Close</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #${BANNER_ID} {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: min(1120px, calc(100vw - 24px));
      z-index: 2147483647;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #e5e7eb;
    }

    #${BANNER_ID} .policyguard-shell {
      display: grid;
      grid-template-columns: minmax(240px, 1.4fr) minmax(240px, 1fr) auto;
      gap: 14px 16px;
      align-items: center;
      padding: 16px 18px;
      background: linear-gradient(135deg, rgba(2, 6, 23, .98), rgba(15, 23, 42, .96));
      border: 1px solid rgba(148, 163, 184, .18);
      border-radius: 18px;
      box-shadow: 0 24px 50px rgba(2, 6, 23, .35);
      backdrop-filter: blur(18px);
    }

    #${BANNER_ID} .policyguard-brand {
      display: flex;
      gap: 14px;
      align-items: center;
      min-width: 0;
    }

    #${BANNER_ID} .policyguard-logo {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
      background: rgba(255, 255, 255, .05);
    }

    #${BANNER_ID} .policyguard-copy { min-width: 0; }
    #${BANNER_ID} .policyguard-eyebrow {
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: #fca5a5;
      margin-bottom: 4px;
    }

    #${BANNER_ID} .policyguard-title {
      font-size: 15px;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.25;
    }

    #${BANNER_ID} .policyguard-summary {
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.45;
      color: #cbd5e1;
      max-width: 52ch;
    }

    #${BANNER_ID} .policyguard-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(72px, 1fr));
      gap: 10px;
    }

    #${BANNER_ID} .policyguard-metric {
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(15, 23, 42, .9);
      border: 1px solid rgba(148, 163, 184, .14);
    }

    #${BANNER_ID} .policyguard-metric span {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    #${BANNER_ID} .policyguard-metric strong {
      display: block;
      font-size: 20px;
      line-height: 1;
      color: #fff;
    }

    #${BANNER_ID} .policyguard-risks {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 40px;
      align-content: center;
    }

    #${BANNER_ID} .policyguard-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 100%;
      padding: 8px 10px;
      border-radius: 999px;
      border: 0;
      background: rgba(15, 23, 42, .72);
      color: #e2e8f0;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #${BANNER_ID} .policyguard-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-end;
    }

    #${BANNER_ID} .policyguard-button {
      border: 0;
      border-radius: 12px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform .15s ease, opacity .15s ease, background .15s ease;
    }

    #${BANNER_ID} .policyguard-button:hover { transform: translateY(-1px); }
    #${BANNER_ID} .policyguard-button:disabled { opacity: .6; cursor: progress; }
    #${BANNER_ID} .policyguard-primary { background: #ef4444; color: #fff; }
    #${BANNER_ID} .policyguard-secondary { background: rgba(148, 163, 184, .14); color: #e2e8f0; }

    #${BANNER_ID}.policyguard-loading .policyguard-primary { background: #334155; }

    @media (max-width: 960px) {
      #${BANNER_ID} .policyguard-shell {
        grid-template-columns: 1fr;
        padding: 14px;
      }

      #${BANNER_ID} .policyguard-metrics {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      #${BANNER_ID} .policyguard-risks {
        min-height: auto;
      }

      #${BANNER_ID} .policyguard-actions {
        justify-content: flex-start;
      }
    }

    @media (max-width: 640px) {
      #${BANNER_ID} {
        width: min(1120px, calc(100vw - 12px));
        top: 12px;
      }

      #${BANNER_ID} .policyguard-shell {
        padding: 12px;
      }

      #${BANNER_ID} .policyguard-brand {
        align-items: flex-start;
      }

      #${BANNER_ID} .policyguard-metrics {
        grid-template-columns: 1fr;
      }

      #${BANNER_ID} .policyguard-actions {
        flex-direction: column;
        align-items: stretch;
      }

      #${BANNER_ID} .policyguard-button {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(banner);

  const updateBannerTone = (riskLevel) => {
    const tone = getRiskTone(riskLevel);
    banner.className = tone.ring ? `${BANNER_ID} ${tone.ring}` : BANNER_ID;
    const shell = banner.querySelector(".policyguard-shell");
    if (shell) {
      shell.style.background = tone.accent;
    }
  };

  const setLoadingState = (isLoading) => {
    banner.classList.toggle("policyguard-loading", isLoading);
    const deepAnalysisButton = banner.querySelector('[data-role="deepAnalysis"]');
    if (deepAnalysisButton) {
      deepAnalysisButton.disabled = isLoading;
      deepAnalysisButton.textContent = isLoading ? "Analyzing..." : "Deep Analysis";
    }
  };

  const setAnalysisState = (analysis) => {
    const summaryEl = banner.querySelector('[data-role="summary"]');
    const riskScoreEl = banner.querySelector('[data-role="riskScore"]');
    const riskLevelEl = banner.querySelector('[data-role="riskLevel"]');
    const confidenceEl = banner.querySelector('[data-role="confidence"]');
    const risksEl = banner.querySelector('[data-role="risks"]');

    if (summaryEl) summaryEl.textContent = analysis.summary || "No summary available yet.";
    if (riskScoreEl) riskScoreEl.textContent = typeof analysis.riskScore === "number" ? String(analysis.riskScore) : "--";
    if (riskLevelEl) riskLevelEl.textContent = analysis.riskLevel || "--";
    if (confidenceEl) confidenceEl.textContent = typeof analysis.confidence === "number" ? `${analysis.confidence}%` : "--";

    if (risksEl) {
      const topRisks = Array.isArray(analysis.topRisks) ? analysis.topRisks.slice(0, 3) : [];
      risksEl.innerHTML = topRisks.length > 0
        ? topRisks.map((risk) => `<span class="policyguard-chip">⚠ ${risk.title}</span>`).join("")
        : "";

      risksEl.style.display = topRisks.length > 0 ? "flex" : "none";
    }

    updateBannerTone(analysis.riskLevel);
  };

  const setErrorState = (message) => {
    const summaryEl = banner.querySelector('[data-role="summary"]');
    const risksEl = banner.querySelector('[data-role="risks"]');
    if (summaryEl) summaryEl.textContent = message;
    if (risksEl) risksEl.innerHTML = '<span class="policyguard-chip">Quick scan unavailable</span>';
    updateBannerTone("Low");
  };

  const deepAnalysisButton = banner.querySelector('[data-role="deepAnalysis"]');
  const closeButton = banner.querySelector('[data-role="close"]');

  if (deepAnalysisButton) {
    deepAnalysisButton.addEventListener("click", () => {
      window.location.href = buildAnalysisUrl();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      banner.remove();
    });
  }

  return {
    setLoadingState,
    setAnalysisState,
    setErrorState,
  };
};

const shouldAnalyze = () => isPrivacyPage();

const runQuickAnalysis = async (ui) => {
  if (!ui) {
    return;
  }

  setTimeout(() => { }, 0);
  ui.setLoadingState(true);

  try {
    const response = await chrome.runtime.sendMessage({
      type: "POLICYGUARD_ANALYZE_PAGE",
      payload: {
        url: window.location.href,
        title: document.title || "",
        text: extractPolicySnippet(),
      },
    });

    if (!response?.success || !response?.data) {
      throw new Error(response?.error || "Unable to analyze page");
    }

    ui.setAnalysisState(response.data);
  } catch (error) {
    console.error("POLICYGUARD ERROR:", error);
    ui.setErrorState(error?.message || "Quick scan failed");
  } finally {
    ui.setLoadingState(false);
  }
};

const init = () => {
  if (!shouldAnalyze()) {
    return;
  }

  const ui = createBanner();
  if (!ui) {
    return;
  }

  runQuickAnalysis(ui);
};

init();

setTimeout(() => {
  if (shouldAnalyze()) {
    init();
  }
}, 2500);