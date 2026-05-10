const {
  getHistory,
  getAnalysisById,
  deleteAnalysis,
} = require('../services/historyService');
const { buildDashboardStats, normalizeHistoryRecord } = require('../utils/responseHelper');
const { get: cacheGet, set: cacheSet } = require('../services/cachingService');

const getHistoryController = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const source = typeof req.query.source === 'string' ? req.query.source.trim() : '';
    const riskLevel = typeof req.query.riskLevel === 'string' ? req.query.riskLevel.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'newest';

    const cacheKey = `history:list:${userId}:${limit}:${source || 'all'}:${riskLevel || 'all'}:${sort}`;
    const cachedResult = cacheGet(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }

    const items = await getHistory({ userId, limit, source, riskLevel, sort });
    const normalizedItems = Array.isArray(items)
      ? items.map(normalizeHistoryRecord).filter(Boolean)
      : [];

    const response = {
      success: true,
      count: normalizedItems.length,
      items: normalizedItems,
    };

    cacheSet(cacheKey, response, 300000);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getSingleAnalysisController = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const record = await getAnalysisById(req.params.id, userId);

    if (!record) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.status(200).json({
      success: true,
      analysis: normalizeHistoryRecord(record),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnalysisController = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const deleted = await deleteAnalysis(req.params.id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis deleted',
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const items = await getHistory({ userId, limit: 1000 });
    const stats = buildDashboardStats(items);

    res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Phase 7 names
  getHistoryController,
  getSingleAnalysisController,
  deleteAnalysisController,
  // Backward-compatible names
  listHistory: getHistoryController,
  getHistoryItem: getSingleAnalysisController,
  getDashboardStats,
};