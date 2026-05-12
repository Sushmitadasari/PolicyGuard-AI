/**
 * Cache Stats Controller
 * Provides cache statistics and management endpoints
 */

const { getStats, clear, cleanupExpired, getApproximateSize } = require('../services/cachingService');

/**
 * Get cache statistics
 */
const getCacheStats = async (req, res, next) => {
  try {
    const stats = getStats();
    const approximateSize = getApproximateSize();

    res.status(200).json({
      cache: {
        ...stats,
        approximateSizeBytes: approximateSize,
        approximateSizeKB: Math.round(approximateSize / 1024),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all cache
 */
const clearCache = async (req, res, next) => {
  try {
    const cleared = clear();

    res.status(200).json({
      message: `Cache cleared. ${cleared} entries removed.`,
      cleared,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clean up expired cache entries
 */
const cleanupCache = async (req, res, next) => {
  try {
    const removed = cleanupExpired();
    const stats = getStats();

    res.status(200).json({
      message: `Cache cleanup completed. ${removed} expired entries removed.`,
      removed,
      remainingEntries: stats.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCacheStats,
  clearCache,
  cleanupCache,
};
