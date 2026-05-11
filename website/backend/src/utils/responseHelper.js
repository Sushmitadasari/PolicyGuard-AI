const normalizeRiskScore = (score) => {
  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score < 0) {
    return 0;
  }

  if (score > 10) {
    return 10;
  }

  return Math.round(score);
};

const normalizeRiskLevel = (level) => {
  const validLevels = ['Low', 'Medium', 'High'];

  if (typeof level !== 'string') {
    return '';
  }

  const trimmed = level.trim();
  return validLevels.includes(trimmed) ? trimmed : '';
};

const normalizeClause = (clause) => {
  if (!clause || typeof clause !== 'object' || Array.isArray(clause)) {
    return null;
  }

  const clauseText = typeof clause.clause === 'string' ? clause.clause.trim() : '';
  if (!clauseText) {
    return null;
  }

  return {
    clause: clauseText,
    type: typeof clause.type === 'string' ? clause.type.trim() : '',
    severity: typeof clause.severity === 'string' ? clause.severity.trim() : '',
    explanation: typeof clause.explanation === 'string' ? clause.explanation.trim() : '',
  };
};

const normalizeClauses = (clauses) => {
  if (!Array.isArray(clauses)) {
    return [];
  }

  return clauses.map(normalizeClause).filter(Boolean);
};

const calculateConfidenceScore = ({
  summary = '',
  risks = [],
  simplified = [],
  clauses = [],
  riskScore = 0,
  riskLevel = '',
  chunkCount = 1,
} = {}) => {
  let confidence = 52;

  confidence += Math.min(16, normalizeRiskScore(riskScore) * 1.5);
  confidence += Array.isArray(risks) && risks.length > 0 ? Math.min(12, risks.length * 2) : 0;
  confidence += typeof summary === 'string' && summary.trim() ? 10 : 0;
  confidence += Array.isArray(simplified) && simplified.length > 0 ? 6 : 0;
  confidence += Array.isArray(clauses) && clauses.length > 0 ? Math.min(12, clauses.length * 2) : 0;
  confidence += normalizeRiskLevel(riskLevel) ? 4 : 0;

  if (chunkCount > 1) {
    confidence -= Math.min(8, chunkCount - 1);
  }

  if (Array.isArray(risks) && risks.length >= 3) {
    confidence += 3;
  }

  return Math.max(0, Math.min(100, Math.round(confidence)));
};

const buildFrontendAnalysisResponse = ({
  summary = '',
  riskScore = 0,
  riskLevel = '',
  confidence,
  risks = [],
  simplified = [],
  clauses = [],
} = {}, options = {}) => {
  const normalizedClauses = normalizeClauses(clauses);
  const resolvedConfidence = Number.isFinite(confidence)
    ? Math.max(0, Math.min(100, Math.round(confidence)))
    : calculateConfidenceScore({
      summary,
      risks,
      simplified,
      clauses: normalizedClauses,
      riskScore,
      riskLevel,
      chunkCount: Number.isFinite(options.chunkCount) ? options.chunkCount : 1,
    });

  return {
    success: true,
    analysis: {
      summary: typeof summary === 'string' ? summary : '',
      riskScore: normalizeRiskScore(riskScore),
      riskLevel: normalizeRiskLevel(riskLevel),
      confidence: resolvedConfidence,
      risks: Array.isArray(risks) ? risks.filter((item) => typeof item === 'string') : [],
      simplified: Array.isArray(simplified) ? simplified.filter((item) => typeof item === 'string') : [],
      clauses: normalizedClauses,
    },
    metadata: {
      filename: typeof options.filename === 'string' ? options.filename : '',
      processedAt: new Date().toISOString(),
      analysisTimeMs: Number.isFinite(options.analysisTimeMs) ? options.analysisTimeMs : 0,
      ...(Number.isFinite(options.pageCount) ? { pageCount: options.pageCount } : {}),
      ...(Number.isFinite(options.chunkCount) ? { chunkCount: options.chunkCount } : {}),
    },
  };
};

const normalizeHistoryRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const fileName = typeof record.fileName === 'string' && record.fileName.trim()
    ? record.fileName.trim()
    : typeof record.documentName === 'string' ? record.documentName.trim() : '';

  return {
    id: typeof record._id === 'string' ? record._id : record._id?.toString?.() || '',
    fileName,
    documentName: fileName,
    analysisType: typeof record.analysisType === 'string' ? record.analysisType.trim() : '',
    source: typeof record.source === 'string' ? record.source.trim() : '',
    summary: typeof record.summary === 'string' ? record.summary.trim() : '',
    riskScore: normalizeRiskScore(record.riskScore),
    riskLevel: normalizeRiskLevel(record.riskLevel),
    confidence: Number.isFinite(record.confidence) ? Math.max(0, Math.min(100, Math.round(record.confidence))) : 0,
    risks: Array.isArray(record.risks) ? record.risks.filter((item) => typeof item === 'string') : [],
    simplified: Array.isArray(record.simplified) ? record.simplified.filter((item) => typeof item === 'string') : [],
    clauses: normalizeClauses(record.clauses),
    metadata: record.metadata && typeof record.metadata === 'object' ? record.metadata : {},
    createdAt: record.createdAt || null,
    updatedAt: record.updatedAt || null,
  };
};

const buildDashboardStats = (records = []) => {
  const items = Array.isArray(records) ? records.map(normalizeHistoryRecord).filter(Boolean) : [];
  const totalAnalyses = items.length;
  const averageRiskScore = totalAnalyses > 0
    ? Math.round(items.reduce((sum, item) => sum + item.riskScore, 0) / totalAnalyses)
    : 0;
  const averageConfidence = totalAnalyses > 0
    ? Math.round(items.reduce((sum, item) => sum + item.confidence, 0) / totalAnalyses)
    : 0;

  const riskLevelBreakdown = items.reduce((accumulator, item) => {
    const level = item.riskLevel || 'Unknown';
    accumulator[level] = (accumulator[level] || 0) + 1;
    return accumulator;
  }, {});

  const sourceBreakdown = items.reduce((accumulator, item) => {
    const source = item.source || 'Unknown';
    accumulator[source] = (accumulator[source] || 0) + 1;
    return accumulator;
  }, {});

  return {
    totalAnalyses,
    averageRiskScore,
    averageConfidence,
    riskLevelBreakdown,
    sourceBreakdown,
    recentItems: items.slice(0, 5),
  };
};

const buildApiSuccessResponse = (data = {}, meta = {}) => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...(meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {}),
  },
});

const buildApiErrorResponse = (code, message, details = {}, meta = {}) => ({
  success: false,
  error: {
    code: typeof code === 'string' && code.trim() ? code.trim() : 'INTERNAL_ERROR',
    message: typeof message === 'string' && message.trim() ? message.trim() : 'Something went wrong',
    details: details && typeof details === 'object' && !Array.isArray(details) ? details : {},
  },
  meta: {
    timestamp: new Date().toISOString(),
    ...(meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {}),
  },
});

module.exports = {
  buildFrontendAnalysisResponse,
  normalizeHistoryRecord,
  buildDashboardStats,
  calculateConfidenceScore,
  normalizeClauses,
  buildApiSuccessResponse,
  buildApiErrorResponse,
};