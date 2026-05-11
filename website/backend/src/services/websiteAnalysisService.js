const { askAI } = require('./aiService');
const { buildPolicyAnalysisPrompt } = require('../utils/promptBuilder');
const { detectRuleBasedRisks, mergeRiskLists, buildRiskAssessment } = require('./riskService');
const { requiresChunking, chunkText, mergeChunkResults } = require('./chunkingService');
const { buildFrontendAnalysisResponse } = require('../utils/responseHelper');
const { fetchWebsiteHtml } = require('../scraper/websiteScraper');
const { extractReadableText } = require('../scraper/privacyExtractor');
const { riskRules } = require('../constants/riskRules');

const DEFAULT_ANALYSIS = Object.freeze({
  summary: '',
  risks: [],
  riskScore: 0,
  riskLevel: '',
  simplified: [],
  clauses: [],
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

  if (codeBlockMatch?.[1]) {
    candidates.push(codeBlockMatch[1].trim());
  }

  if (objectMatch?.[0]) {
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

const severityLabelFromScore = (score) => {
  if (score >= 3) {
    return 'High';
  }

  if (score === 2) {
    return 'Medium';
  }

  return 'Low';
};

const extractRiskClauses = (text) => {
  if (typeof text !== 'string' || !text.trim()) {
    return [];
  }

  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const clauses = [];
  const seen = new Set();

  for (const sentence of sentences) {
    const normalizedSentence = sentence.toLowerCase();

    for (const rule of riskRules) {
      const matched = Array.isArray(rule.patterns) && rule.patterns.some((pattern) => {
        const safeFlags = pattern.flags.replace(/g/g, '');
        const safePattern = new RegExp(pattern.source, safeFlags);
        return safePattern.test(normalizedSentence);
      });

      if (!matched) {
        continue;
      }

      const key = `${rule.id}:${sentence}`.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      clauses.push({
        clause: sentence,
        type: rule.category,
        severity: severityLabelFromScore(rule.severity),
        explanation: rule.riskText,
      });
    }
  }

  return clauses;
};

const getAnalyzeResultWithRetry = async (text, maxAttempts = 3) => {
  const prompt = buildPolicyAnalysisPrompt(text);

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

const analyzeWebsiteText = async (text) => {
  if (!requiresChunking(text)) {
    return getAnalyzeResultWithRetry(text, 3);
  }

  const chunks = chunkText(text);
  const chunkResults = [];

  for (const chunk of chunks) {
    try {
      const result = await getAnalyzeResultWithRetry(chunk, 2);
      chunkResults.push(result);
    } catch (error) {
      console.error('Error analyzing website chunk:', error.message);
      chunkResults.push(DEFAULT_ANALYSIS);
    }
  }

  return mergeChunkResults(chunkResults);
};

const analyzeWebsite = async (url) => {
  const startTime = Date.now();

  let html, finalUrl, statusCode;

  try {
    const fetchResult = await fetchWebsiteHtml(url);
    html = fetchResult.html;
    finalUrl = fetchResult.finalUrl;
    statusCode = fetchResult.statusCode;
  } catch (fetchError) {
    console.error('Website fetch failed:', {
      url,
      error: fetchError.message,
    });
    throw new Error(
      fetchError.message || 'Failed to fetch website content. Please verify the URL and try again.'
    );
  }

  const extracted = extractReadableText(html, finalUrl);
  const text = extracted.text;

  if (!text || text.trim().length < 100) {
    throw new Error(
      'Website content is empty or too short to analyze. The page may be JavaScript-heavy or blocked.'
    );
  }

  const chunkCount = requiresChunking(text) ? chunkText(text).length : 1;
  const aiAnalysis = await analyzeWebsiteText(text);

  const ruleBased = detectRuleBasedRisks(text);
  aiAnalysis.risks = mergeRiskLists(aiAnalysis.risks, ruleBased.risks);
  const clauses = extractRiskClauses(text);

  const assessment = buildRiskAssessment({
    ruleScore: ruleBased.totalScore,
    riskCount: aiAnalysis.risks.length,
    categoryCount: ruleBased.categories.length,
    aiRiskScore: aiAnalysis.riskScore,
    aiRiskLevel: aiAnalysis.riskLevel,
  });

  aiAnalysis.riskScore = assessment.riskScore;
  aiAnalysis.riskLevel = assessment.riskLevel;
  applyRuleBasedFallbacks(aiAnalysis, ruleBased);

  const response = buildFrontendAnalysisResponse({
    summary: aiAnalysis.summary,
    riskScore: aiAnalysis.riskScore,
    riskLevel: aiAnalysis.riskLevel,
    risks: aiAnalysis.risks,
    simplified: aiAnalysis.simplified,
    clauses,
  }, {
    filename: extracted.title || finalUrl,
    analysisTimeMs: Date.now() - startTime,
    chunkCount,
  });

  response.metadata.url = finalUrl;
  response.metadata.title = extracted.title;
  response.metadata.httpStatusCode = statusCode;

  return {
    response,
    analysis: {
      ...response.analysis,
      clauses,
    },
    text,
    fileName: extracted.title || finalUrl,
    finalUrl,
    title: extracted.title,
    statusCode,
  };
};

module.exports = {
  analyzeWebsite,
};