const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const { askAI } = require('./aiService');
const { buildPolicyAnalysisPrompt } = require('../utils/promptBuilder');
const { detectRuleBasedRisks, mergeRiskLists, buildRiskAssessment } = require('./riskService');
const { requiresChunking, chunkText, mergeChunkResults } = require('./chunkingService');
const { analyzeWebsite } = require('./websiteAnalysisService');
const { saveAnalysis } = require('./historyService');
const { riskRules } = require('../constants/riskRules');
const { cacheManager } = require('./cacheManager');
const { withTimer, logger } = require('../config/logger');
const {
  buildFrontendAnalysisResponse,
  buildApiSuccessResponse,
  buildApiErrorResponse,
} = require('../utils/responseHelper');

const DEFAULT_ANALYSIS = Object.freeze({
  summary: '',
  risks: [],
  riskScore: 0,
  riskLevel: '',
  simplified: [],
  clauses: [],
});

const ALLOWED_MODES = new Set(['quick', 'full']);
const ALLOWED_SOURCES = new Set(['web', 'extension', 'pdf', 'api']);
const ALLOWED_TYPES = new Set(['website', 'pdf', 'text']);

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const normalizeMode = (mode) => {
  const normalized = normalizeString(mode).toLowerCase();
  return ALLOWED_MODES.has(normalized) ? normalized : 'full';
};

const normalizeSource = (source) => {
  const normalized = normalizeString(source).toLowerCase();
  return ALLOWED_SOURCES.has(normalized) ? normalized : 'api';
};

const normalizeType = (type) => {
  const normalized = normalizeString(type).toLowerCase();
  return ALLOWED_TYPES.has(normalized) ? normalized : 'text';
};

const extractPayloadText = (payload = {}) => {
  const candidates = [
    payload.text,
    payload.content,
    payload.policy,
    payload.policyText,
    payload.body,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
};

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_error) {
    return false;
  }
};

const severityLabelFromScore = (score) => {
  if (score >= 3) {
    return 'High';
  }

  if (score === 2) {
    return 'Medium';
  }

  return 'Low';
};

const extractRiskMatches = (text) => {
  if (typeof text !== 'string' || !text.trim()) {
    return [];
  }

  const normalizedText = text.toLowerCase();
  const matches = [];
  const seen = new Set();

  for (const rule of riskRules) {
    const matched = Array.isArray(rule.patterns) && rule.patterns.some((pattern) => {
      const safeFlags = pattern.flags.replace(/g/g, '');
      const safePattern = new RegExp(pattern.source, safeFlags);
      return safePattern.test(normalizedText);
    });

    if (!matched) {
      continue;
    }

    const key = rule.id.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    matches.push({
      id: rule.id,
      title: rule.riskText,
      severity: severityLabelFromScore(rule.severity),
      category: rule.category,
    });
  }

  return matches;
};

const computeQuickRiskScore = (riskMatches = [], ruleBased = {}, text = '') => {
  let score = 12;

  score += Math.min(42, (ruleBased.totalScore || 0) * 14);
  score += Math.min(24, riskMatches.length * 8);
  score += Math.min(12, (ruleBased.categories || []).length * 4);
  score += text.length > 2500 ? 5 : 0;
  score += text.length > 5000 ? 5 : 0;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const getRiskLevelFromPercent = (score) => {
  if (score >= 70) {
    return 'High';
  }

  if (score >= 40) {
    return 'Medium';
  }

  return 'Low';
};

const computeQuickConfidence = (riskMatches = [], text = '') => {
  let confidence = 55;

  confidence += Math.min(18, riskMatches.length * 6);
  confidence += Math.min(12, new Set(riskMatches.map((item) => item.category)).size * 4);
  confidence += text.length > 1500 ? 5 : 0;
  confidence += text.length > 3500 ? 5 : 0;

  return Math.max(0, Math.min(100, Math.round(confidence)));
};

const normalizeResultForResponse = (analysis = DEFAULT_ANALYSIS) => {
  const frontend = buildFrontendAnalysisResponse({
    summary: analysis.summary,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    confidence: analysis.confidence,
    risks: analysis.risks,
    simplified: analysis.simplified,
    clauses: analysis.clauses,
  });

  return {
    summary: frontend.analysis.summary,
    riskScoreNormalized: frontend.analysis.riskScore,
    riskScore: Math.max(0, Math.min(100, Math.round((frontend.analysis.riskScore || 0) * 10))),
    riskLevel: frontend.analysis.riskLevel,
    confidence: frontend.analysis.confidence,
    risks: frontend.analysis.risks,
    simplified: frontend.analysis.simplified,
    clauses: frontend.analysis.clauses,
  };
};

const safeParseJson = (rawText) => {
  if (typeof rawText === 'object' && rawText !== null) {
    return rawText;
  }

  if (typeof rawText !== 'string' || rawText.trim() === '') {
    return null;
  }

  const candidates = [rawText.trim()];
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const objectMatch = rawText.match(/\{[\s\S]*\}/);

  if (codeBlockMatch && codeBlockMatch[1]) {
    candidates.push(codeBlockMatch[1].trim());
  }

  if (objectMatch && objectMatch[0]) {
    candidates.push(objectMatch[0].trim());
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (_error) {
      // Continue checking other candidates.
    }
  }

  return null;
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeRiskScore = (riskScore) => {
  if (!Number.isFinite(riskScore)) {
    return 0;
  }

  if (riskScore < 0) {
    return 0;
  }

  if (riskScore > 10) {
    return 10;
  }

  return Math.round(riskScore);
};

const normalizeRiskLevel = (riskLevel) => {
  if (typeof riskLevel !== 'string') {
    return '';
  }

  const normalized = riskLevel.trim();
  return ['Low', 'Medium', 'High', ''].includes(normalized) ? normalized : '';
};

const normalizeAnalyzePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return DEFAULT_ANALYSIS;
  }

  return {
    summary: typeof payload.summary === 'string' ? payload.summary.trim() : '',
    risks: normalizeStringArray(payload.risks),
    riskScore: normalizeRiskScore(payload.riskScore),
    riskLevel: normalizeRiskLevel(payload.riskLevel),
    simplified: normalizeStringArray(payload.simplified),
    clauses: Array.isArray(payload.clauses) ? payload.clauses : [],
  };
};

const hasUsefulAnalyzeData = (analysis) => Boolean(
  analysis.summary ||
  analysis.riskLevel ||
  analysis.risks.length > 0 ||
  analysis.simplified.length > 0
);

const applyRuleBasedFallbacks = (analysis, ruleBased) => {
  if (!analysis.summary && ruleBased.risks.length > 0) {
    analysis.summary = `Potential policy risk detected: ${ruleBased.risks.join(', ')}.`;
  }

  if ((!analysis.simplified || analysis.simplified.length === 0) && ruleBased.risks.length > 0) {
    analysis.simplified = ruleBased.risks.map((risk) => `Potential issue: ${risk}.`);
  }

  return analysis;
};

const analyzeTextWithChunking = async (text) => {
  if (!requiresChunking(text)) {
    const prompt = buildPolicyAnalysisPrompt(text);
    const rawResponse = await askAI(prompt);
    const parsed = safeParseJson(rawResponse);
    return normalizeAnalyzePayload(parsed);
  }

  const chunks = chunkText(text);
  const chunkResults = [];

  for (const chunk of chunks) {
    try {
      const prompt = buildPolicyAnalysisPrompt(chunk);
      const rawResponse = await askAI(prompt);
      const parsed = safeParseJson(rawResponse);
      const normalized = normalizeAnalyzePayload(parsed);

      if (hasUsefulAnalyzeData(normalized)) {
        chunkResults.push(normalized);
      } else {
        chunkResults.push(DEFAULT_ANALYSIS);
      }
    } catch (_error) {
      chunkResults.push(DEFAULT_ANALYSIS);
    }
  }

  return mergeChunkResults(chunkResults);
};

const getQuickAnalysis = async ({ text, source, type, metadata = {} }) => {
  const startTime = Date.now();
  const safeText = normalizeString(text);

  if (!safeText) {
    throw Object.assign(new Error('Text content is required for quick analysis'), {
      code: 'INVALID_PAYLOAD',
      statusCode: 400,
      details: { field: 'text' },
    });
  }

  const ruleBased = detectRuleBasedRisks(safeText);
  const riskMatches = extractRiskMatches(safeText);
  const riskScore = computeQuickRiskScore(riskMatches, ruleBased, safeText);
  const riskLevel = getRiskLevelFromPercent(riskScore);
  const confidence = computeQuickConfidence(riskMatches, safeText);
  const summary = riskMatches.length > 0
    ? `Detected ${riskMatches.slice(0, 3).map((item) => item.title).join(', ')}.`
    : 'No major policy risks detected in the quick scan.';
  const topRisks = riskMatches.slice(0, 3).map((item) => ({
    title: item.title,
    severity: item.severity,
    category: item.category,
  }));
  const analysisType = type === 'website' ? 'WEBSITE_QUICK' : type === 'pdf' ? 'PDF_QUICK' : 'TEXT_QUICK';

  const shouldPersist = metadata.persist !== false;
  let analysisId = '';

  if (shouldPersist) {
    const saved = await saveAnalysis({
      userId: metadata.userId || '',
      source,
      policyText: safeText,
      analysis: {
        summary,
        riskScore: normalizeRiskScore(riskScore / 10),
        riskLevel,
        confidence,
        risks: topRisks.map((item) => item.title),
        simplified: topRisks.map((item) => `${item.title} (${item.severity})`),
        clauses: topRisks.map((item) => ({
          clause: item.title,
          type: item.category,
          severity: item.severity,
          explanation: item.title,
        })),
      },
      documentName: metadata.documentName || '',
      fileName: metadata.fileName || '',
      analysisType,
      metadata: {
        ...metadata,
        mode: 'quick',
        source,
        type,
        quick: true,
      },
    });

    analysisId = saved?._id?.toString?.() || '';
  }

  return {
    data: {
      analysisId,
      source,
      type,
      mode: 'quick',
      summary,
      riskScore,
      riskScoreNormalized: normalizeRiskScore(riskScore / 10),
      riskLevel,
      confidence,
      topRisks,
      risks: topRisks.map((item) => item.title),
      clauses: topRisks.map((item) => ({
        clause: item.title,
        type: item.category,
        severity: item.severity,
        explanation: item.title,
      })),
      recommendations: topRisks.length > 0
        ? ['Review the highlighted terms before proceeding.', 'Consider a full analysis for a more detailed report.']
        : ['No immediate high-risk terms found.'],
    },
    meta: {
      quick: true,
      persisted: Boolean(analysisId),
      analysisTimeMs: Date.now() - startTime,
      source,
      type,
    },
  };
};

const getFullWebsiteAnalysis = async ({ url, source, metadata = {} }) => {
  const startTime = Date.now();

  if (!url || typeof url !== 'string' || !isValidHttpUrl(url)) {
    throw Object.assign(new Error('A valid website URL is required for full analysis'), {
      code: 'INVALID_PAYLOAD',
      statusCode: 400,
      details: { field: 'url' },
    });
  }

  const websiteResult = await analyzeWebsite(url);
  const normalized = normalizeResultForResponse({
    ...websiteResult.analysis,
    summary: websiteResult.analysis?.summary || websiteResult.response?.analysis?.summary || '',
    riskScore: websiteResult.analysis?.riskScore ?? websiteResult.response?.analysis?.riskScore ?? 0,
    riskLevel: websiteResult.analysis?.riskLevel || websiteResult.response?.analysis?.riskLevel || '',
    confidence: websiteResult.response?.analysis?.confidence ?? websiteResult.analysis?.confidence,
    risks: websiteResult.analysis?.risks || websiteResult.response?.analysis?.risks || [],
    simplified: websiteResult.analysis?.simplified || websiteResult.response?.analysis?.simplified || [],
    clauses: websiteResult.analysis?.clauses || websiteResult.response?.analysis?.clauses || [],
  });

  const shouldPersist = metadata.persist !== false;
  let analysisId = '';

  if (shouldPersist) {
    const saved = await saveAnalysis({
      userId: metadata.userId || '',
      source,
      policyText: websiteResult.text,
      analysis: {
        summary: normalized.summary,
        riskScore: normalized.riskScoreNormalized,
        riskLevel: normalized.riskLevel,
        confidence: normalized.confidence,
        risks: normalized.risks,
        simplified: normalized.simplified,
        clauses: normalized.clauses,
      },
      documentName: websiteResult.fileName,
      fileName: websiteResult.fileName,
      analysisType: 'WEBSITE',
      metadata: {
        ...metadata,
        mode: 'full',
        source,
        type: 'website',
        url: websiteResult.finalUrl,
        title: websiteResult.title,
        statusCode: websiteResult.statusCode,
      },
    });

    analysisId = saved?._id?.toString?.() || '';
  }

  return {
    data: {
      analysisId,
      source,
      type: 'website',
      mode: 'full',
      summary: normalized.summary,
      riskScore: normalized.riskScore,
      riskScoreNormalized: normalized.riskScoreNormalized,
      riskLevel: normalized.riskLevel,
      confidence: normalized.confidence,
      risks: normalized.risks,
      clauses: normalized.clauses,
      recommendations: websiteResult.response?.analysis?.simplified || normalized.simplified,
      topRisks: normalized.risks.slice(0, 3).map((risk) => ({
        title: risk,
        severity: normalized.riskLevel,
      })),
      metadata: {
        url: websiteResult.finalUrl,
        title: websiteResult.title,
        httpStatusCode: websiteResult.statusCode,
      },
    },
    meta: {
      quick: false,
      persisted: Boolean(analysisId),
      analysisTimeMs: Date.now() - startTime,
      source,
      type: 'website',
    },
  };
};

const getFullTextAnalysis = async ({ text, source, type, metadata = {} }) => {
  const startTime = Date.now();
  const safeText = normalizeString(text);

  if (!safeText) {
    throw Object.assign(new Error('Text content is required for full analysis'), {
      code: 'INVALID_PAYLOAD',
      statusCode: 400,
      details: { field: 'text' },
    });
  }

  let analysis = await analyzeTextWithChunking(safeText);
  const ruleBased = detectRuleBasedRisks(safeText);
  analysis.risks = mergeRiskLists(analysis.risks, ruleBased.risks);
  const assessment = buildRiskAssessment({
    ruleScore: ruleBased.totalScore,
    riskCount: analysis.risks.length,
    categoryCount: ruleBased.categories.length,
    aiRiskScore: analysis.riskScore,
    aiRiskLevel: analysis.riskLevel,
  });

  analysis.riskScore = assessment.riskScore;
  analysis.riskLevel = assessment.riskLevel;
  analysis = applyRuleBasedFallbacks(analysis, ruleBased);

  const extractedClauses = extractRiskMatches(safeText).map((item) => ({
    clause: item.title,
    type: item.category,
    severity: item.severity,
    explanation: item.title,
  }));

  const confidence = buildFrontendAnalysisResponse({
    summary: analysis.summary,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    risks: analysis.risks,
    simplified: analysis.simplified,
    clauses: extractedClauses,
  }).analysis.confidence;

  const finalAnalysis = {
    summary: analysis.summary,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    confidence,
    risks: analysis.risks,
    simplified: analysis.simplified,
    clauses: extractedClauses,
  };

  const shouldPersist = metadata.persist === true || metadata.persist === undefined;
  let analysisId = '';

  if (shouldPersist) {
    const saved = await saveAnalysis({
      userId: metadata.userId || '',
      source,
      policyText: safeText,
      analysis: finalAnalysis,
      documentName: metadata.documentName || '',
      fileName: metadata.fileName || '',
      analysisType: type === 'pdf' ? 'PDF' : 'TEXT',
      metadata: {
        ...metadata,
        mode: 'full',
        source,
        type,
      },
    });

    analysisId = saved?._id?.toString?.() || '';
  }

  const normalized = normalizeResultForResponse(finalAnalysis);

  return {
    data: {
      analysisId,
      source,
      type,
      mode: 'full',
      summary: normalized.summary,
      riskScore: normalized.riskScore,
      riskScoreNormalized: normalized.riskScoreNormalized,
      riskLevel: normalized.riskLevel,
      confidence: normalized.confidence,
      risks: normalized.risks,
      clauses: normalized.clauses,
      recommendations: normalized.simplified,
      topRisks: normalized.risks.slice(0, 3).map((risk) => ({
        title: risk,
        severity: normalized.riskLevel,
      })),
      metadata: {
        length: safeText.length,
        analysisType: type === 'pdf' ? 'PDF' : 'TEXT',
      },
    },
    meta: {
      quick: false,
      persisted: Boolean(analysisId),
      analysisTimeMs: Date.now() - startTime,
      source,
      type,
    },
  };
};

const resolveAuthenticatedUser = async (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string' || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email name');

    if (!user) {
      return null;
    }

    return {
      userId: user._id.toString(),
      user: user.toObject ? user.toObject() : user,
    };
  } catch (_error) {
    return null;
  }
};

const analyze = async (payload = {}, options = {}) => {
  return withTimer('analysis.orchestrator', async () => {
    const mode = normalizeMode(payload.mode);
    const source = normalizeSource(payload.source);
    const type = normalizeType(payload.type);
    const analysisPayload = payload.payload && typeof payload.payload === 'object' && !Array.isArray(payload.payload)
      ? payload.payload
      : {};
    const metadata = payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {};

    const authContext = await resolveAuthenticatedUser(options.authorization || payload.authorization || '');
    const userId = authContext?.userId || '';
    const persistInput = normalizeBoolean(payload.options?.persist, false);
    const consent = normalizeBoolean(payload.options?.consent, false);
    const persist = mode === 'quick'
      ? Boolean(persistInput && consent && userId)
      : payload.options?.persist === false
        ? false
        : true;

    const mergedMetadata = {
      ...metadata,
      ...(options.metadata && typeof options.metadata === 'object' && !Array.isArray(options.metadata) ? options.metadata : {}),
      userId,
      persist,
      source,
      mode,
      type,
      consent,
    };

    const cacheIdentity = mode === 'quick'
      ? extractPayloadText(analysisPayload)
      : type === 'website'
        ? normalizeString(analysisPayload.url || payload.url || payload.websiteUrl)
        : extractPayloadText(analysisPayload);

    const cacheHash = cacheManager.hashValue(`${source}|${type}|${mode}|${cacheIdentity}`);
    const cacheBucket = mode === 'quick' && source === 'extension' ? 'extension-quick' : 'analysis';
    const cached = await cacheManager.get([cacheBucket, cacheHash]);
    if (cached && !persist) {
      logger.info({ event: 'analysis-cache-hit', source, type, mode, cacheBucket });
      return cached;
    }

    let result;

    if (mode === 'quick') {
      const text = extractPayloadText(analysisPayload);
      result = await getQuickAnalysis({
        text,
        source,
        type,
        metadata: mergedMetadata,
      });
    } else if (type === 'website') {
      const url = normalizeString(analysisPayload.url || payload.url || payload.websiteUrl);
      result = await getFullWebsiteAnalysis({
        url,
        source,
        metadata: mergedMetadata,
      });
    } else {
      const text = extractPayloadText(analysisPayload);
      result = await getFullTextAnalysis({
        text,
        source,
        type,
        metadata: mergedMetadata,
      });
    }

    if (!persist) {
      const ttl = cacheBucket === 'extension-quick'
        ? cacheManager.cacheTTL.extensionQuick()
        : cacheManager.cacheTTL.analysis();
      await cacheManager.set([cacheBucket, cacheHash], result, ttl);
    }

    return result;
  }, {
    source: payload?.source,
    type: payload?.type,
    mode: payload?.mode,
  });
};

const createOrchestratorErrorResponse = (error, fallbackCode = 'INTERNAL_ERROR') => {
  const statusCode = Number.isFinite(error?.statusCode) ? error.statusCode : 500;
  const code = typeof error?.code === 'string' ? error.code : fallbackCode;
  const message = typeof error?.message === 'string' ? error.message : 'Analysis failed';
  const details = error?.details && typeof error.details === 'object' && !Array.isArray(error.details)
    ? error.details
    : {};

  return {
    statusCode,
    body: buildApiErrorResponse(code, message, details),
  };
};

const createOrchestratorSuccessResponse = (result, extraMeta = {}) => ({
  statusCode: 200,
  body: buildApiSuccessResponse(result.data, {
    ...extraMeta,
    ...(result.meta || {}),
  }),
});

module.exports = {
  analyze,
  createOrchestratorErrorResponse,
  createOrchestratorSuccessResponse,
};