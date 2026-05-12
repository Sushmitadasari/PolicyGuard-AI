/**
 * Standardized Chat Context Builder
 * Ensures all chatbot flows use consistent analysis context structure
 * across PDF, Website, Extension, and History sources
 */

const normalizeAnalysisContext = (analysisRecord = {}) => {
  if (!analysisRecord || typeof analysisRecord !== 'object') {
    return null;
  }

  return {
    analysisId: analysisRecord._id?.toString() || analysisRecord.id || '',
    source: analysisRecord.source || 'api',
    summary: analysisRecord.summary || '',
    risks: Array.isArray(analysisRecord.risks) ? analysisRecord.risks.filter(Boolean) : [],
    riskScore: typeof analysisRecord.riskScore === 'number' ? analysisRecord.riskScore : 0,
    riskLevel: analysisRecord.riskLevel || '',
    clauses: Array.isArray(analysisRecord.clauses)
      ? analysisRecord.clauses.map((clause) => ({
        clause: clause?.clause || clause || '',
        type: clause?.type || '',
        severity: clause?.severity || '',
        explanation: clause?.explanation || '',
      }))
      : [],
    recommendations: Array.isArray(analysisRecord.recommendations)
      ? analysisRecord.recommendations.filter(Boolean)
      : [],
    confidence: typeof analysisRecord.confidence === 'number' ? analysisRecord.confidence : 0,
    metadata: analysisRecord.metadata || {},
    fileName: analysisRecord.fileName || analysisRecord.documentName || '',
    policyText: analysisRecord.policyText || '',
    createdAt: analysisRecord.createdAt || new Date().toISOString(),
  };
};

const buildChatContextEnvelope = (analysis = null) => {
  if (!analysis) {
    return {
      hasAnalysis: false,
      analysis: null,
      contextSummary: 'No analysis context available.',
    };
  }

  const normalized = normalizeAnalysisContext(analysis);

  return {
    hasAnalysis: true,
    analysis: normalized,
    contextSummary: buildContextSummary(normalized),
    contextForPrompt: buildContextForPrompt(normalized),
  };
};

const buildContextSummary = (analysis) => {
  if (!analysis) return 'No context';

  const parts = [];

  if (analysis.summary) {
    parts.push(`Summary: ${analysis.summary.substring(0, 200)}`);
  }

  if (analysis.riskScore !== undefined) {
    parts.push(`Risk Score: ${analysis.riskScore}/10`);
  }

  if (analysis.riskLevel) {
    parts.push(`Risk Level: ${analysis.riskLevel}`);
  }

  if (analysis.risks && analysis.risks.length > 0) {
    parts.push(`Detected Risks: ${analysis.risks.slice(0, 3).join(', ')}`);
  }

  if (analysis.confidence !== undefined) {
    parts.push(`Confidence: ${analysis.confidence}%`);
  }

  return parts.join(' | ') || 'Analysis context loaded.';
};

const buildContextForPrompt = (analysis) => {
  if (!analysis) {
    return {
      documentInfo: 'No document information.',
      analysisInfo: 'No analysis information.',
      riskInfo: 'No risk information.',
      clauseInfo: 'No clause information.',
    };
  }

  return {
    documentInfo: analysis.fileName ? `Document: ${analysis.fileName}` : `Analysis from: ${analysis.source}`,
    analysisInfo: `Risk Score: ${analysis.riskScore}/10 | Risk Level: ${analysis.riskLevel || 'Not specified'} | Confidence: ${analysis.confidence}%`,
    riskInfo: analysis.risks.length
      ? `Detected Risks: ${analysis.risks.map((r) => `"${r}"`).join(', ')}`
      : 'No specific risks detected.',
    clauseInfo:
      analysis.clauses.length > 0
        ? `Key Clauses: ${analysis.clauses
          .slice(0, 3)
          .map((c) => `${c.type || 'Clause'}: ${c.clause.substring(0, 100)}...`)
          .join(' | ')}`
        : 'No specific clauses extracted.',
  };
};

module.exports = {
  normalizeAnalysisContext,
  buildChatContextEnvelope,
  buildContextSummary,
  buildContextForPrompt,
};
