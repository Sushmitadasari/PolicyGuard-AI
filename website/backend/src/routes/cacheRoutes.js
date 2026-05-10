/**
 * Cache Routes
 * Endpoints for cache management and statistics
 */

const express = require('express');
const {
  getCacheStats,
  clearCache,
  cleanupCache,
} = require('../controllers/cacheController');

const router = express.Router();

// GET cache statistics
router.get('/stats', getCacheStats);

// POST clear all cache
router.post('/clear', clearCache);

// POST cleanup expired entries
router.post('/cleanup', cleanupCache);

module.exports = router;
