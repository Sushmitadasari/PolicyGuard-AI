import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";
import { useAnalytics } from "../context/AnalyticsContext";

function PDFResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  console.log(location.state);

  const analysis =
    location.state?.analysis ??
    location.state?.data?.analysis ??
    location.state?.data ??
    analytics?.latestAnalyses?.pdf ??
    location.state ??
    null;

  const summary = analysis?.summary ?? analysis?.executiveSummary ?? "";
  const riskScore = Number(analysis?.riskScore ?? analysis?.risk_score ?? 0);
  const riskLevel =
    analysis?.riskLevel ??
    analysis?.risk_level ??
    (riskScore >= 75 ? "High" : riskScore >= 40 ? "Medium" : "Low");
  const confidence = Number(analysis?.confidence ?? 0);

  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  const clauses = Array.isArray(analysis?.clauses) ? analysis.clauses : [];
  const simplified = Array.isArray(analysis?.simplified)
    ? analysis.simplified
    : typeof analysis?.simplified === "string"
    ? [analysis.simplified]
    : [];

  const hasData = Boolean(analysis && Object.keys(analysis).length > 0);

  const recommendations =
    risks.length > 0
      ? [
          "Review permissions carefully",
          "Avoid sharing sensitive data unnecessarily",
          "Disable unnecessary tracking and auto-renewals",
          "Read cancellation and data-sharing clauses closely",
        ]
      : ["No major risks detected. Still review the policy carefully."];

  const getRiskTone = (level) => {
    if (level === "Critical" || level === "High") {
      return {
        badge: "bg-red-500/20 text-red-300 border-red-500/30",
        accent: "from-red-500/20 to-transparent",
        dot: "bg-red-500",
      };
    }

    if (level === "Medium") {
      return {
        badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        accent: "from-yellow-500/20 to-transparent",
        dot: "bg-yellow-500",
      };
    }

    return {
      badge: "bg-green-500/20 text-green-300 border-green-500/30",
      accent: "from-green-500/20 to-transparent",
      dot: "bg-green-500",
    };
  };

  const normalizeSeverity = (value) => {
    if (!value) return "Low";
    const text = String(value).toLowerCase();
    if (text.includes("critical")) return "Critical";
    if (text.includes("high")) return "High";
    if (text.includes("medium")) return "Medium";
    return "Low";
  };

  const normalizeClauseText = (clause) =>
    clause?.text ?? clause?.clauseText ?? clause?.description ?? clause?.message ?? "";

  // Auto-detect severity based on risk keywords
  const detectSeverityFromContent = (title, description) => {
    const content = `${title} ${description}`.toLowerCase();
    const highKeywords = [
      "sharing",
      "tracking",
      "biometric",
      "financial",
      "surveillance",
      "sell",
      "sold",
      "third-party",
      "advertiser",
      "affiliate",
      "payment",
      "credit card",
      "ssn",
      "social security",
      "health",
      "medical",
      "location tracking",
      "gps",
      "spyware",
    ];
    const mediumKeywords = [
      "cookie",
      "analytics",
      "retention",
      "log",
      "collect",
      "data retention",
      "profile",
      "segment",
      "behavioral",
      "target",
    ];

    if (highKeywords.some((k) => content.includes(k))) return "High";
    if (mediumKeywords.some((k) => content.includes(k))) return "Medium";
    return "Low";
  };

  // Risk descriptions based on type
  const getRiskDescription = (title) => {
    const lowerTitle = (title ?? "").toLowerCase();
    const descriptions = {
      "third-party":
        "Your data may be shared with external advertisers, partners, or affiliate networks.",
      sharing:
        "Your personal information may be shared with external entities.",
      tracking:
        "This platform may monitor your activity, behavior, and browsing patterns.",
      "auto-renewal":
        "Your subscription may renew automatically without clear notice or easy cancellation.",
      "automatic renewal":
        "Your subscription may renew automatically without clear notice or easy cancellation.",
      cookie:
        "The platform uses cookies to track your online behavior and preferences.",
      analytics:
        "Your activity data is collected for analysis and behavioral profiling.",
      location:
        "Your location data may be collected and used for targeting or tracking.",
      biometric:
        "Your biometric data (fingerprint, face, voice) is collected and stored.",
      financial:
        "Financial information including payment methods may be at risk.",
      "liability waiver":
        "The company limits its responsibility for damages or losses.",
      "warranty disclaimer":
        "The platform provides limited or no warranty for its services.",
      "user agreement":
        "You must review terms carefully as they define your rights and obligations.",
    };

    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerTitle.includes(key)) return desc;
    }

    return "This policy clause may introduce legal or privacy risks. Review carefully.";
  };

  // Deduplicate and enhance risks
  const deduplicateRisks = (riskArray) => {
    const seen = new Set();
    return riskArray
      .filter((risk) => {
        const key = String(risk?.title ?? risk?.risk ?? risk?.description ?? "")
          .toLowerCase()
          .trim();
        if (seen.has(key) || !key) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 9) // Limit to 9 unique risks for visual balance
      .map((risk, index) => {
        const title =
          risk?.title ??
          risk?.risk ??
          (risk?.description ? risk.description.substring(0, 50) : `Risk ${index + 1}`);
        const description =
          risk?.description ?? risk?.details ?? risk?.explanation ?? "";
        const existingSeverity = normalizeSeverity(
          risk?.severity ?? risk?.level ?? risk?.riskLevel
        );
        const autoSeverity = detectSeverityFromContent(title, description);
        const finalSeverity = existingSeverity !== "Low" ? existingSeverity : autoSeverity;

        return {
          title: String(title)
            .replace(/^(the |a |an )/i, "")
            .replace(/\s+/g, " ")
            .trim(),
          description: description || getRiskDescription(title),
          severity: finalSeverity,
        };
      });
  };

  const deduplicatedRisks = deduplicateRisks(risks);

  // Smart clause type to readable title mapping
  const normalizeClauseType = (rawType) => {
    const typeMap = {
      "data-sharing": "Third-Party Data Sharing",
      "third-party": "Third-Party Data Sharing",
      "data-collection": "Data Collection & Storage",
      collection: "Data Collection & Storage",
      tracking: "User Tracking & Monitoring",
      "user-tracking": "User Tracking & Monitoring",
      retention: "Data Retention Policy",
      "data-retention": "Data Retention Policy",
      "auto-renewal": "Automatic Renewal Terms",
      "automatic-renewal": "Automatic Renewal Terms",
      "auto renewal": "Automatic Renewal Terms",
      liability: "Liability Waiver",
      warranty: "Warranty Disclaimer",
      "warranty-disclaimer": "Warranty Disclaimer",
      cookies: "Cookie & Tracking Technology",
      "cookie-policy": "Cookie & Tracking Technology",
      analytics: "Analytics & Behavioral Profiling",
      "user-agreement": "User Agreement & Terms",
      "terms-of-service": "Terms of Service",
      privacy: "Privacy Policy",
      "gdpr-compliance": "GDPR & Compliance",
      location: "Location Data Collection",
      biometric: "Biometric Data Collection",
      payments: "Payment & Financial Data",
      "payment-info": "Payment & Financial Data",
    };

    const lowerType = String(rawType ?? "").toLowerCase().trim();
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.includes(key) || key.includes(lowerType.replace(/-/g, " "))) {
        return value;
      }
    }

    // Capitalize and format if not in map
    return String(rawType ?? "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  // Get descriptions for different clause types
  const getClauseDescription = (clauseType) => {
    const typeMap = {
      "Third-Party Data Sharing":
        "This clause permits sharing your data with external companies, advertisers, or partners for marketing or analytics purposes.",
      "Data Collection & Storage":
        "The platform collects and stores various types of user data. Review what information is gathered and how long it's retained.",
      "User Tracking & Monitoring":
        "Your online activities and behavior may be monitored to understand usage patterns or for targeted advertising.",
      "Data Retention Policy":
        "Data may be retained for extended periods. Check when and how your information is deleted.",
      "Automatic Renewal Terms":
        "Subscriptions or services may automatically renew unless explicitly cancelled before the renewal date.",
      "Liability Waiver":
        "The company limits or excludes its liability for damages, losses, or service interruptions.",
      "Warranty Disclaimer":
        "Limited or no warranties are provided for the service or product. Use is at your own risk.",
      "Cookie & Tracking Technology":
        "Cookies and tracking pixels monitor your behavior across the platform and partner websites.",
      "Analytics & Behavioral Profiling":
        "Your behavior data is analyzed to build profiles and deliver targeted content or advertisements.",
      "User Agreement & Terms":
        "Comprehensive terms defining your rights, obligations, and acceptable use of the platform.",
      "Terms of Service":
        "Legal terms governing your use of the service and the company's responsibilities.",
      "Privacy Policy":
        "Details how your personal data is collected, used, stored, and potentially shared.",
      "GDPR & Compliance":
        "The platform claims compliance with GDPR or other privacy regulations.",
      "Location Data Collection":
        "Your precise or approximate location may be collected via GPS, IP address, or other means.",
      "Biometric Data Collection":
        "Biometric information such as fingerprints, face recognition, or voice patterns may be collected.",
      "Payment & Financial Data":
        "Payment information and financial data are collected. Review security measures and retention policies.",
    };

    return (
      typeMap[clauseType] ||
      "This clause contains important legal terms. Please review carefully for compliance and risk."
    );
  };

  // Detect severity of clause based on type
  const detectClauseSeverity = (clauseType) => {
    const lowerType = String(clauseType ?? "").toLowerCase();

    const highRisk = [
      "data-sharing",
      "third-party",
      "tracking",
      "biometric",
      "location",
      "payment",
      "financial",
      "liability",
      "warrant",
    ];
    const mediumRisk = [
      "collection",
      "retention",
      "analytics",
      "cookie",
      "auto-renewal",
    ];

    if (highRisk.some((keyword) => lowerType.includes(keyword))) return "High";
    if (mediumRisk.some((keyword) => lowerType.includes(keyword)))
      return "Medium";
    return "Low";
  };

  // Deduplicate and enhance clauses
  const deduplicateClauses = (clauseArray) => {
    const seen = new Set();
    return clauseArray
      .filter((clause) => {
        const typeKey = String(
          clause?.type ?? clause?.title ?? clause?.clause ?? ""
        )
          .toLowerCase()
          .trim();
        if (seen.has(typeKey) || !typeKey) return false;
        seen.add(typeKey);
        return true;
      })
      .slice(0, 8) // Limit to 8 unique clauses
      .map((clause) => {
        const rawType = clause?.type ?? clause?.title ?? "Clause";
        const normalizedTitle = normalizeClauseType(rawType);
        const description =
          clause?.explanation ??
          clause?.description ??
          clause?.whyRisky ??
          getClauseDescription(normalizedTitle);
        const severity = detectClauseSeverity(normalizedTitle);

        return {
          title: normalizedTitle,
          description: description.substring(0, 200), // Limit description length
          severity,
          rawText: clause?.text ?? clause?.clauseText ?? "",
        };
      });
  };

  const deduplicatedClauses = deduplicateClauses(clauses);

  if (!hasData) {
    return (
      <DashboardLayout>
        <PageHeader
          title="PDF Analysis Result"
          subtitle="View detailed analysis results"
        />

        <div className="rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl p-10 text-center">
          <h3 className="text-3xl font-black mb-4">No analysis data found</h3>
          <p className="text-white/60 mb-8">
            Upload a PDF first so the analysis result can be displayed here.
          </p>
          <button
            onClick={() => navigate("/pdf-analyzer")}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            Back to Upload
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const riskTone = getRiskTone(riskLevel);
  const confidenceDisplay =
    confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);

  return (
    <DashboardLayout>
      <PageHeader
        title="PDF Analysis Result"
        subtitle="Enterprise AI detailed analysis and risk assessment"
      />

      <section
        className={`relative overflow-hidden rounded-[3rem] border border-white/10 bg-linear-to-br ${riskTone.accent} p-10 mb-10`}
      >
        <div className="absolute top-0 right-0 w-[320px] h-80 bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-white/40 text-sm uppercase tracking-wider mb-3">
              Risk Score
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl font-black">{riskScore}</h2>
              <span className="text-2xl text-white/40">/100</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/40 text-sm uppercase tracking-wider mb-3">
              Risk Level
            </p>
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border text-4xl font-black ${riskTone.badge}`}
            >
              <span className={`w-3 h-3 rounded-full ${riskTone.dot}`} />
              {riskLevel}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/40 text-sm uppercase tracking-wider mb-3">
              Confidence
            </p>
            <div className="text-4xl font-black text-cyan-400">
              {confidenceDisplay}%
            </div>
          </motion.div>
        </div>
      </section>

      {summary && (
        <section className="rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl p-10 mb-10">
          <h3 className="text-3xl font-black mb-6">Executive Summary</h3>
          <p className="text-white/70 leading-relaxed text-lg">{summary}</p>
        </section>
      )}

      {deduplicatedRisks.length > 0 && (
        <section className="mb-10">
          <h3 className="text-3xl font-black mb-8">Detected Risks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deduplicatedRisks.map((risk, index) => {
              const tone = getRiskTone(risk.severity);

              return (
                <motion.div
                  key={`risk-${index}-${risk.title}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-3xl border border-white/10 bg-white/3 backdrop-blur-3xl p-6 hover:border-white/20 hover:shadow-lg hover:shadow-${risk.severity === "High" ? "red" : risk.severity === "Medium" ? "yellow" : "green"}-500/20 transition-all`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`mt-2 w-3 h-3 rounded-full ${tone.dot}`} />
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
                        {risk.severity} Risk
                      </p>
                      <h4 className="text-lg font-bold leading-snug">
                        {risk.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {risk.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {clauses.length > 0 && (
        <section className="mb-10">
          <h3 className="text-3xl font-black mb-8">Detected Clauses</h3>
          <h4 className="text-lg text-white/60 mb-6">
            {deduplicatedClauses.length} unique clause{deduplicatedClauses.length !== 1 ? "s" : ""} detected
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deduplicatedClauses.map((clause, index) => {
              const tone = getRiskTone(clause.severity);

              return (
                <motion.div
                  key={`clause-${index}-${clause.title}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`rounded-3xl border border-white/10 bg-white/3 backdrop-blur-3xl p-6 hover:border-white/20 hover:shadow-lg hover:shadow-${clause.severity === "High" ? "red" : clause.severity === "Medium" ? "yellow" : "green"}-500/20 transition-all`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
                        Policy Clause
                      </p>
                      <h4 className="text-xl font-bold leading-snug">
                        {clause.title}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border whitespace-nowrap ${tone.badge}`}
                    >
                      {clause.severity} Risk
                    </span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {clause.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {simplified.length > 0 && (
        <section className="rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl p-10 mb-10">
          <h3 className="text-3xl font-black mb-6">Simplified Explanations</h3>
          <ul className="space-y-4 text-white/70 leading-relaxed">
            {simplified.map((item, index) => (
              <li key={`${index}-${item}`} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-cyan-400 shrink-0" />
                <span>
                  {typeof item === "string"
                    ? item
                    : item?.text ?? item?.description ?? String(item)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl p-10 mb-10">
        <h3 className="text-3xl font-black mb-6">AI Recommendations</h3>
        <ul className="space-y-4 text-white/70 leading-relaxed">
          {recommendations.map((item, index) => (
            <li key={`${index}-${item}`} className="flex gap-3">
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
        <button
          onClick={() => navigate("/pdf-analyzer")}
          className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
        >
          Analyze Another PDF
        </button>
        <button
          onClick={() => window.print()}
          className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
        >
          Download Report
        </button>
        <button
          onClick={() =>
            navigate("/pdf-chat", {
              state: {
                pdfAnalysis: analysis,
              },
            })
          }
          className="px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all"
        >
          Ask AI About This PDF
        </button>
      </div>
    </DashboardLayout>
  );
}

export default PDFResultPage;
