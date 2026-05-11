const {
  getHistory,
  countHistory,
  getAnalysisById,
  deleteAnalysis,
} = require('../services/historyService');
const { buildDashboardStats, normalizeHistoryRecord } = require('../utils/responseHelper');
const { cacheManager } = require('../services/cacheManager');

const getHistoryController = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const source = typeof req.query.source === 'string' ? req.query.source.trim() : '';
    const riskLevel = typeof req.query.riskLevel === 'string' ? req.query.riskLevel.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'newest';

    const cacheKeyParts = ['history', 'list', userId || 'guest', page, limit, source || 'all', riskLevel || 'all', sort];
    const cachedResult = await cacheManager.get(cacheKeyParts);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }

    const [items, total] = await Promise.all([
      getHistory({ userId, page, limit, source, riskLevel, sort }),
      countHistory({ userId, source, riskLevel }),
    ]);

    const normalizedItems = Array.isArray(items)
      ? items.map(normalizeHistoryRecord).filter(Boolean)
      : [];

    const response = {
      success: true,
      count: normalizedItems.length,
      items: normalizedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };

    await cacheManager.set(cacheKeyParts, response, cacheManager.cacheTTL.history());

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
    const cacheKeyParts = ['dashboard', 'stats', userId || 'guest'];
    const cached = await cacheManager.get(cacheKeyParts);
    if (cached) {
      return res.status(200).json(cached);
    }

    const items = await getHistory({ userId, page: 1, limit: 1000 });
    const stats = buildDashboardStats(items);

    const response = {
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    };

    await cacheManager.set(cacheKeyParts, response, cacheManager.cacheTTL.dashboard());

    res.status(200).json(response);
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