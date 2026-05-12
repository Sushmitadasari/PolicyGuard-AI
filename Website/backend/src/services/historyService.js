const mongoose = require('mongoose');
const AnalysisRecord = require('../models/analysisModel');
const { isDatabaseConnected } = require('../config/db');
const { normalizeClauses } = require('../utils/responseHelper');
const { clearHistoryCache } = require('./cachingService');
const { cacheManager } = require('./cacheManager');

const normalizeAnalysisForStorage = (analysis) => ({
  summary: typeof analysis?.summary === 'string' ? analysis.summary.trim() : '',
  confidence: Number.isFinite(analysis?.confidence) ? analysis.confidence : 0,
  risks: Array.isArray(analysis?.risks) ? analysis.risks.filter((item) => typeof item === 'string') : [],
  riskScore: Number.isFinite(analysis?.riskScore) ? analysis.riskScore : 0,
  riskLevel: typeof analysis?.riskLevel === 'string' ? analysis.riskLevel.trim() : '',
  simplified: Array.isArray(analysis?.simplified) ? analysis.simplified.filter((item) => typeof item === 'string') : [],
  clauses: normalizeClauses(analysis?.clauses),
});

const toSafeLimit = (value, fallback = 20) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 100);
};

const saveAnalysis = async (data = {}) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  const {
    source = 'analyze',
    analysisType = '',
    userId = '',
    fileName = '',
    documentName = '',
    policyText = '',
    summary = '',
    risks = [],
    riskScore = 0,
    riskLevel = '',
    confidence = 0,
    simplified = [],
    clauses = [],
    metadata = {},
    analysis,
  } = data;

  const normalizedFromAnalysis = normalizeAnalysisForStorage(analysis || {
    summary,
    risks,
    riskScore,
    riskLevel,
    confidence,
    simplified,
    clauses,
  });

  try {
    const created = await AnalysisRecord.create({
      source,
      analysisType: typeof analysisType === 'string' ? analysisType.trim() : '',
      userId: typeof userId === 'string' ? userId.trim() : '',
      policyText: typeof policyText === 'string' ? policyText.trim() : '',
      documentName: typeof documentName === 'string' ? documentName.trim() : '',
      fileName: typeof fileName === 'string' && fileName.trim() ? fileName.trim() : typeof documentName === 'string' ? documentName.trim() : '',
      metadata: metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {},
      ...normalizedFromAnalysis,
    });

    // Log successful save for debugging purposes
    try {
      console.log(`Saved analysis to MongoDB (source=${source}) id=${created._id} userId=${created.userId}`);
    } catch (logErr) {
      // ignore logging errors
    }

    clearHistoryCache(created.userId);
    await cacheManager.delByPrefix(['history', 'list', created.userId || '']);
    await cacheManager.delByPrefix(['dashboard', 'stats', created.userId || '']);

    return created;
  } catch (error) {
    console.warn(`Skipping history save: ${error.message}`);
    return null;
  }
};

const getHistory = async ({ userId, page = 1, limit = 20, source, riskLevel, sort = 'newest' } = {}) => {
  if (!isDatabaseConnected()) {
    return [];
  }

  const query = {};

  // Filter by userId if provided (for authenticated users)
  if (typeof userId === 'string' && userId.trim()) {
    query.userId = userId.trim();
  }

  if (typeof source === 'string' && source.trim()) {
    query.source = source.trim();
  }

  if (typeof riskLevel === 'string' && riskLevel.trim()) {
    query.riskLevel = riskLevel.trim();
  }

  const sortQuery = sort === 'highest-risk'
    ? { riskScore: -1, createdAt: -1 }
    : { createdAt: -1 };

  const safeLimit = toSafeLimit(limit);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  return AnalysisRecord.find(query)
    .select('source summary confidence risks riskScore riskLevel simplified clauses documentName fileName analysisType metadata createdAt updatedAt userId')
    .sort(sortQuery)
    .skip(skip)
    .limit(safeLimit)
    .lean();
};

const countHistory = async ({ userId, source, riskLevel } = {}) => {
  if (!isDatabaseConnected()) {
    return 0;
  }

  const query = {};

  if (typeof userId === 'string' && userId.trim()) {
    query.userId = userId.trim();
  }

  if (typeof source === 'string' && source.trim()) {
    query.source = source.trim();
  }

  if (typeof riskLevel === 'string' && riskLevel.trim()) {
    query.riskLevel = riskLevel.trim();
  }

  return AnalysisRecord.countDocuments(query);
};

const getAnalysisById = async (id, userId) => {
  if (!isDatabaseConnected() || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const query = { _id: id };

  // Verify user ownership if userId provided
  if (typeof userId === 'string' && userId.trim()) {
    query.userId = userId.trim();
  }

  return AnalysisRecord.findOne(query).lean();
};

const deleteAnalysis = async (id, userId) => {
  if (!isDatabaseConnected() || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const query = { _id: id };

  // Verify user ownership if userId provided
  if (typeof userId === 'string' && userId.trim()) {
    query.userId = userId.trim();
  }

  const deleted = await AnalysisRecord.findOneAndDelete(query).lean();

  if (deleted) {
    clearHistoryCache(deleted.userId || userId);
    await cacheManager.delByPrefix(['history', 'list', deleted.userId || userId || '']);
    await cacheManager.delByPrefix(['dashboard', 'stats', deleted.userId || userId || '']);
  }

  return deleted;
};

// Backward-compatible aliases for existing callsites.
const saveAnalysisHistory = saveAnalysis;
const getAnalysisHistory = getHistory;
const getAnalysisHistoryById = getAnalysisById;

module.exports = {
  saveAnalysis,
  getHistory,
  countHistory,
  getAnalysisById,
  deleteAnalysis,
  saveAnalysisHistory,
  getAnalysisHistory,
  getAnalysisHistoryById,
};