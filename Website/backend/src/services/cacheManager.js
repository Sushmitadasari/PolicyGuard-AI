const crypto = require('crypto');
const { createClient } = require('redis');
const config = require('../config/centralConfig');
const { logger } = require('../config/logger');

const fallbackCache = new Map();
let redisClient = null;
let redisReady = false;

const buildKey = (parts = []) => {
  const prefix = config.get('REDIS_CACHE_PREFIX', 'policyguard');
  return [prefix, ...parts.map((p) => String(p))].join(':');
};

const hashValue = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const ensureRedis = async () => {
  if (!config.get('REDIS_ENABLED', false)) {
    return false;
  }

  if (redisClient && redisReady) {
    return true;
  }

  if (!redisClient) {
    redisClient = createClient({ url: config.get('REDIS_URL') });
    redisClient.on('error', (error) => {
      redisReady = false;
      logger.warn({ event: 'redis-error', message: error.message });
    });
    redisClient.on('ready', () => {
      redisReady = true;
      logger.info({ event: 'redis-ready' });
    });
  }

  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      redisReady = true;
      logger.info({ event: 'redis-connected' });
    } catch (error) {
      redisReady = false;
      logger.warn({ event: 'redis-connect-failed', message: error.message });
      return false;
    }
  }

  return redisReady;
};

const now = () => Date.now();

const getFallback = (key) => {
  const entry = fallbackCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < now()) {
    fallbackCache.delete(key);
    return null;
  }
  return entry.value;
};

const setFallback = (key, value, ttlSec) => {
  const expiresAt = ttlSec ? now() + ttlSec * 1000 : null;
  fallbackCache.set(key, { value, expiresAt });
};

const delFallbackByPrefix = (prefix) => {
  let count = 0;
  for (const key of fallbackCache.keys()) {
    if (key.startsWith(prefix)) {
      fallbackCache.delete(key);
      count += 1;
    }
  }
  return count;
};

const get = async (parts) => {
  const key = buildKey(parts);

  if (await ensureRedis()) {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  return getFallback(key);
};

const set = async (parts, value, ttlSec) => {
  const key = buildKey(parts);

  if (await ensureRedis()) {
    const serialized = JSON.stringify(value);
    if (ttlSec) {
      await redisClient.setEx(key, ttlSec, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  }

  setFallback(key, value, ttlSec);
  return true;
};

const delByPrefix = async (parts) => {
  const prefix = buildKey(parts);

  if (await ensureRedis()) {
    const keys = await redisClient.keys(`${prefix}*`);
    if (keys.length) {
      await redisClient.del(keys);
    }
    return keys.length;
  }

  return delFallbackByPrefix(prefix);
};

const health = async () => {
  if (!(await ensureRedis())) {
    return { mode: 'memory-fallback', ok: true };
  }

  try {
    const pong = await redisClient.ping();
    return { mode: 'redis', ok: pong === 'PONG' };
  } catch (_error) {
    return { mode: 'redis', ok: false };
  }
};

const cacheTTL = {
  dashboard: () => config.get('CACHE_DASHBOARD_TTL_SEC', 180),
  history: () => config.get('CACHE_HISTORY_TTL_SEC', 120),
  analysis: () => config.get('CACHE_ANALYSIS_TTL_SEC', 300),
  chatbotSession: () => config.get('CACHE_CHAT_SESSION_TTL_SEC', 3600),
  extensionQuick: () => config.get('CACHE_EXTENSION_QUICK_TTL_SEC', 120),
};

module.exports = {
  cacheManager: {
    buildKey,
    hashValue,
    get,
    set,
    delByPrefix,
    health,
    cacheTTL,
  },
};
