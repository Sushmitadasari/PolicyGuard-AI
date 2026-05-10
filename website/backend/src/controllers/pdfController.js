const { askAI } = require('../services/aiService');
const { buildPolicyAnalysisPrompt } = require('../utils/promptBuilder');
const { detectRuleBasedRisks, mergeRiskLists, buildRiskAssessment } = require('../services/riskService');
const { saveAnalysis } = require('../services/historyService');
const { requiresChunking, mergeChunkResults } = require('../services/chunkingService');
const { getDefaultAnalysis } = require('../services/responseFormatter');
const { buildFrontendAnalysisResponse } = require('../utils/responseHelper');
const { validatePdfUpload, getSafePdfName } = require('../pdf/pdfValidator');
const { extractPdfText } = require('../pdf/pdfExtractor');
const { chunkPdfText } = require('../pdf/pdfChunker');
const { resolveUploadedPdf } = require('../middleware/uploadMiddleware');
const { riskRules } = require('../constants/riskRules');

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
      // Try next candidate.
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

const deriveConfidence = (analysis, clauses, chunkCount) => {
  return buildFrontendAnalysisResponse({
    summary: analysis.summary,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    risks: analysis.risks,
    simplified: analysis.simplified,
    clauses,
  }, {
    chunkCount,
  }).analysis.confidence;
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

const analyzePdfWithChunking = async (text) => {
  if (!requiresChunking(text)) {
    return getAnalyzeResultWithRetry(buildPolicyAnalysisPrompt(text), 3);
  }

  const chunks = chunkPdfText(text);
  const chunkResults = [];

  for (const chunk of chunks) {
    try {
      const result = await getAnalyzeResultWithRetry(buildPolicyAnalysisPrompt(chunk), 2);
      chunkResults.push(result);
    } catch (error) {
      console.error('Error analyzing PDF chunk:', error.message);
      chunkResults.push(DEFAULT_ANALYSIS);
    }
  }

  return mergeChunkResults(chunkResults);
};

const uploadAndAnalyze = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const file = resolveUploadedPdf(req);
    const validation = validatePdfUpload(file);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const extracted = await extractPdfText(file.buffer);
    const text = typeof extracted.text === 'string' ? extracted.text.trim() : '';

    if (!text) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    const chunkCount = requiresChunking(text) ? chunkPdfText(text).length : 1;
    let analysis = await analyzePdfWithChunking(text);
    const ruleBased = detectRuleBasedRisks(text);
    analysis.risks = mergeRiskLists(analysis.risks, ruleBased.risks);
    const riskyClauses = extractRiskClauses(text);

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
    const confidence = deriveConfidence(analysis, riskyClauses, chunkCount);
    analysis.confidence = confidence;
    analysis.clauses = riskyClauses;

    const response = buildFrontendAnalysisResponse({
      summary: analysis.summary,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      confidence,
      risks: analysis.risks,
      simplified: analysis.simplified,
      clauses: riskyClauses,
    }, {
      filename: getSafePdfName(file),
      pageCount: extracted.pageCount,
      chunkCount,
      analysisTimeMs: Date.now() - startTime,
    });

    const userId = req.user?._id?.toString() || '';
    await saveAnalysis({
      userId,
      source: 'pdf',
      policyText: text,
      analysis,
      documentName: getSafePdfName(file),
      fileName: getSafePdfName(file),
      analysisType: 'PDF',
      metadata: {
        pageCount: extracted.pageCount,
        chunkCount,
      },
    });

    response.metadata.pageCount = extracted.pageCount;
    response.metadata.chunkCount = chunkCount;
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadAndAnalyze,
};
