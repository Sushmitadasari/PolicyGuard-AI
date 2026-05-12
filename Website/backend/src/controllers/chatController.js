const { askAI } = require('../services/aiService');
const { buildPolicyAnalysisPrompt } = require('../utils/promptBuilder');
const {
  detectRuleBasedRisks,
  mergeRiskLists,
  buildRiskAssessment,
} = require('../services/riskService');
const { saveAnalysis } = require('../services/historyService');
const { chunkText, requiresChunking, mergeChunkResults } = require('../services/chunkingService');
const { formatChatResponse, getDefaultAnalysis } = require('../services/responseFormatter');
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
      // Continue trying other extracted JSON candidates.
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

const validateAndNormalizeAnalysis = (payload) => {
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

const hasUsefulContent = (analysis) => {
  return Boolean(
    analysis.summary ||
    analysis.riskLevel ||
    analysis.risks.length > 0 ||
    analysis.simplified.length > 0
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

const getAnalysisWithRetry = async (prompt, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const aiRawResponse = await askAI(prompt);
      const parsed = safeParseJson(aiRawResponse);
      const normalized = validateAndNormalizeAnalysis(parsed);

      if (hasUsefulContent(normalized)) {
        return normalized;
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
    }
  }

  return getDefaultAnalysis();
};

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        error: 'Message cannot be empty',
      });
    }

    // Check cache first
    const cacheKey = generateCacheKey(message, 'chat');
    const cachedResult = cacheKey ? cacheGet(cacheKey) : null;
    if (cachedResult) {
      return res.status(200).json(
        formatChatResponse(message, cachedResult.analysis, {
          metadata: cachedResult.metadata,
        })
      );
    }

    const prompt = buildPolicyAnalysisPrompt(message);
    let analysis = getDefaultAnalysis();

    try {
      // Use chunking for longer messages
      if (requiresChunking(message)) {
        const chunks = chunkText(message);
        const chunkResults = [];
        for (const chunk of chunks) {
          try {
            const chunkAnalysis = await getAnalysisWithRetry(
              buildPolicyAnalysisPrompt(chunk),
              2
            );
            chunkResults.push(chunkAnalysis);
          } catch (error) {
            console.error('Error analyzing chunk:', error.message);
            chunkResults.push(getDefaultAnalysis());
          }
        }
        analysis = mergeChunkResults(chunkResults);
      } else {
        analysis = await getAnalysisWithRetry(prompt, 3);
      }
    } catch (error) {
      console.error('AI fallback used after retries:', error.message);
      analysis = getDefaultAnalysis();
    }

    const ruleBased = detectRuleBasedRisks(message);
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
      cacheSet(cacheKey, { analysis, metadata: { cached: true } }, 3600000);
    }

    const userId = req.user?._id?.toString() || '';
    await saveAnalysis({
      userId,
      source: req.body.analysisSource || 'chat',
      policyText: message,
      analysis,
      analysisType: 'CHAT',
    });

    res.status(200).json(
      formatChatResponse(message, analysis)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
};
