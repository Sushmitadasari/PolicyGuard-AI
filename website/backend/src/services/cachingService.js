/**
 * Caching Service
 * Optional in-memory caching for analysis results to avoid re-processing
 */

const crypto = require('crypto');

// In-memory cache storage
const cache = new Map();

// Configuration
const DEFAULT_TTL = 3600000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 1000; // Maximum entries in cache

/**
 * Generate cache key from text
 * @param {string} text - The text to generate key for
 * @param {string} type - Cache type (analysis, chat, etc.)
 * @returns {string} Cache key
 */
const generateCacheKey = (text, type = 'default') => {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Create hash of the text for consistent key generation
  const hash = crypto.createHash('sha256').update(text.trim()).digest('hex');
  return `${type}:${hash}`;
};

/**
 * Get cached analysis result
 * @param {string} key - Cache key
 * @returns {Object|null} Cached result or null
 */
const get = (key) => {
  if (!key || !cache.has(key)) {
    return null;
  }

  const entry = cache.get(key);

  // Check if entry has expired
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  // Update last access time and return value
  entry.lastAccessed = Date.now();
  entry.accessCount += 1;

  return entry.value;
};

/**
 * Set cached analysis result
 * @param {string} key - Cache key
 * @param {Object} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (default 1 hour)
 * @returns {boolean} True if successful
 */
const set = (key, value, ttl = DEFAULT_TTL) => {
  if (!key || !value) {
    return false;
  }

  // Check cache size and evict if necessary
  if (cache.size >= MAX_CACHE_SIZE) {
    evictOldest();
  }

  cache.set(key, {
    value,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttl,
    lastAccessed: Date.now(),
    accessCount: 0,
  });

  return true;
};

/**
 * Check if key exists in cache (and is not expired)
 * @param {string} key - Cache key
 * @returns {boolean} True if key exists and not expired
 */
const has = (key) => {
  if (!key || !cache.has(key)) {
    return false;
  }

  const entry = cache.get(key);

  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    cache.delete(key);
    return false;
  }

  return true;
};

/**
 * Delete cache entry
 * @param {string} key - Cache key
 * @returns {boolean} True if deleted
 */
const del = (key) => {
  if (!key) {
    return false;
  }

  return cache.delete(key);
};

/**
 * Clear entire cache
 * @returns {number} Number of entries cleared
 */
const clear = () => {
  const size = cache.size;
  cache.clear();
  return size;
};

/**
 * Evict oldest entry (least recently used)
 * @returns {boolean} True if entry evicted
 */
const evictOldest = () => {
  if (cache.size === 0) {
    return false;
  }

  let oldestKey = null;
  let oldestTime = Infinity;

  for (const [key, entry] of cache.entries()) {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey);
    return true;
  }

  return false;
};

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
const getStats = () => {
  let totalAccess = 0;
  let expiredCount = 0;

  for (const entry of cache.values()) {
    totalAccess += entry.accessCount;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      expiredCount += 1;
    }
  }

  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    totalAccesses: totalAccess,
    expiredEntries: expiredCount,
    utilizationPercent: Math.round((cache.size / MAX_CACHE_SIZE) * 100),
  };
};

/**
 * Clean up expired entries
 * @returns {number} Number of entries removed
 */
const cleanupExpired = () => {
  let removed = 0;
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt && now > entry.expiresAt) {
      cache.delete(key);
      removed += 1;
    }
  }

  return removed;
};

/**
 * Get cache size in bytes (approximate)
 * @returns {number} Approximate size in bytes
 */
const getApproximateSize = () => {
  let size = 0;

  for (const entry of cache.values()) {
    size += JSON.stringify(entry.value).length * 2; // Rough estimate (2 bytes per char)
  }

  return size;
};

/**
 * Cache middleware for Express
 * Automatically caches GET requests
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `route:${req.method}:${req.originalUrl || req.url}`;

  const cached = get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Override res.json to cache the response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    if (res.statusCode === 200) {
      set(cacheKey, data, DEFAULT_TTL);
    }

    return originalJson(data);
  };

  next();
};

module.exports = {
  generateCacheKey,
  get,
  set,
  has,
  del,
  clear,
  evictOldest,
  getStats,
  cleanupExpired,
  getApproximateSize,
  cacheMiddleware,
  DEFAULT_TTL,
  MAX_CACHE_SIZE,
};
