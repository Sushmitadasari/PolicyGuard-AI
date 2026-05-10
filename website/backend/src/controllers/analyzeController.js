const { askAI } = require('../services/aiService');
const { buildPolicyAnalysisPrompt } = require('../utils/promptBuilder');
const {
  detectRuleBasedRisks,
  mergeRiskLists,
  buildRiskAssessment,
} = require('../services/riskService');
const { saveAnalysis } = require('../services/historyService');
const { chunkText, requiresChunking, mergeChunkResults } = require('../services/chunkingService');
const { formatAnalysisResponse, getDefaultAnalysis } = require('../services/responseFormatter');
const { generateCacheKey, get: cacheGet, set: cacheSet } = require('../services/cachingService');

const DEFAULT_ANALYSIS = Object.freeze({
  summary: '',
  risks: [],
  riskScore: 0,
  riskLevel: '',
  simplified: [],
});

const ALLOWED_RISK_LEVELS = new Set(['Low', 'Medium', 'High', '']);

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

const normalizeRiskLevel = (riskLevel) => {
  if (typeof riskLevel !== 'string') {
    return '';
  }

  const normalized = riskLevel.trim();
  return ALLOWED_RISK_LEVELS.has(normalized) ? normalized : '';
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

const normalizeAnalyzePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return getDefaultAnalysis();
  }

  return {
    summary: typeof payload.summary === 'string' ? payload.summary.trim() : '',
    risks: normalizeStringArray(payload.risks),
    riskScore: normalizeRiskScore(payload.riskScore),
    riskLevel: normalizeRiskLevel(payload.riskLevel),
    simplified: normalizeStringArray(payload.simplified),
  };
};

const hasUsefulAnalyzeData = (analyze) => {
  return Boolean(
    analyze.summary ||
    analyze.riskLevel ||
    analyze.risks.length > 0 ||
    analyze.simplified.length > 0
  );
};

const applyRuleBasedFallbacks = (analysis, ruleBased) => {
  const riskSummary = ruleBased.risks.length > 0
    ? ruleBased.risks.join(', ')
    : 'policy risks';

  if (!analysis.summary && ruleBased.risks.length > 0) {
    analysis.summary = `Potential policy risk detected: ${riskSummary}.`;
  }

  if ((!analysis.simplified || analysis.simplified.length === 0) && ruleBased.risks.length > 0) {
    analysis.simplified = ruleBased.risks.map((risk) => `Potential issue: ${risk}.`);
  }

  return analysis;
};

const getAnalyzeResultWithRetry = async (prompt, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const rawResponse = await askAI(prompt);
      const parsed = safeParseJson(rawResponse);
      const normalized = normalizeAnalyzePayload(parsed);

      if (hasUsefulAnalyzeData(normalized)) {
        return normalized;
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
    }
  }

  return DEFAULT_ANALYSIS;
};

/**
 * Analyze policy with chunking for large texts
 */
const analyzeWithChunking = async (policy) => {
  if (!requiresChunking(policy)) {
    // Small text - analyze normally
    const prompt = buildPolicyAnalysisPrompt(policy);
    return getAnalyzeResultWithRetry(prompt, 3);
  }

  // Large text - chunk and analyze each chunk
  const chunks = chunkText(policy);
  const chunkResults = [];

  for (const chunk of chunks) {
    try {
      const prompt = buildPolicyAnalysisPrompt(chunk);
      const result = await getAnalyzeResultWithRetry(prompt, 2); // 2 retries for chunks
      chunkResults.push(result);
    } catch (error) {
      console.error('Error analyzing chunk:', error.message);
      chunkResults.push(DEFAULT_ANALYSIS);
    }
  }

  return mergeChunkResults(chunkResults);
};

const analyzePolicy = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { policy } = req.body;
    const source = req.body.analysisSource || 'analyze';
    const documentName = req.body.documentName || '';

    if (!policy || typeof policy !== 'string' || policy.trim() === '') {
      return res.status(400).json({
        error: 'Policy text is required',
        analysis: DEFAULT_ANALYSIS,
      });
    }

    // Check cache first
    const cacheKey = generateCacheKey(policy, 'analyze');
    const cachedResult = cacheKey ? cacheGet(cacheKey) : null;
    if (cachedResult) {
      return res.status(200).json(
        formatAnalysisResponse(cachedResult, policy, {
          analysisTime: Date.now() - startTime,
        })
      );
    }

    let analysis = DEFAULT_ANALYSIS;

    try {
      analysis = await analyzeWithChunking(policy);
    } catch (error) {
      console.error('Analyze fallback used after retries:', error.message);
      analysis = DEFAULT_ANALYSIS;
    }

    // Merge rule-based risks
    const ruleBased = detectRuleBasedRisks(policy);
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

    // Cache result
    if (cacheKey) {
      cacheSet(cacheKey, analysis, 3600000); // Cache for 1 hour
    }

    // Save to history
    const userId = req.user?._id?.toString() || '';
    await saveAnalysis({
      userId,
      source,
      policyText: policy,
      analysis,
      documentName,
      analysisType: 'TEXT',
    });

    const analysisTime = Date.now() - startTime;
    res.status(200).json(
      formatAnalysisResponse(analysis, policy, { analysisTime })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzePolicy,
};
