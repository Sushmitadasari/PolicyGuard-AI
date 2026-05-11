const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  HOST: Joi.string().default('0.0.0.0'),
  MONGO_URI: Joi.string().allow('').optional(),
  JWT_SECRET: Joi.string().min(16).allow('').optional(),
  JWT_EXPIRY: Joi.string().default('7d'),
  FRONTEND_URL: Joi.string().uri({ scheme: ['http', 'https'] }).default('http://localhost:5173'),
  EXTENSION_ALLOWED_IDS: Joi.string().allow('').default(''),
  CORS_ALLOWED_ORIGINS: Joi.string().allow('').default(''),
  MAX_REQUEST_SIZE: Joi.string().default('5mb'),
  REQUEST_TIMEOUT_MS: Joi.number().integer().min(1000).default(30000),
  ANALYSIS_REQUEST_TIMEOUT_MS: Joi.number().integer().min(5000).default(120000),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent').default('info'),
  REDIS_URL: Joi.string().allow('').default('redis://127.0.0.1:6379'),
  REDIS_ENABLED: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  REDIS_CACHE_PREFIX: Joi.string().default('policyguard'),
  CACHE_DASHBOARD_TTL_SEC: Joi.number().integer().min(10).default(180),
  CACHE_HISTORY_TTL_SEC: Joi.number().integer().min(10).default(120),
  CACHE_ANALYSIS_TTL_SEC: Joi.number().integer().min(10).default(300),
  CACHE_CHAT_SESSION_TTL_SEC: Joi.number().integer().min(10).default(3600),
  CACHE_EXTENSION_QUICK_TTL_SEC: Joi.number().integer().min(10).default(120),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(60000),
  RATE_LIMIT_AUTH_MAX: Joi.number().integer().min(1).default(10),
  RATE_LIMIT_ANALYSIS_MAX: Joi.number().integer().min(1).default(30),
  RATE_LIMIT_CHATBOT_MAX: Joi.number().integer().min(1).default(60),
  RATE_LIMIT_GENERAL_MAX: Joi.number().integer().min(1).default(180),
  QUEUE_ENABLED: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  QUEUE_PREFIX: Joi.string().default('policyguard-jobs'),
  ANALYSIS_JOB_ATTEMPTS: Joi.number().integer().min(1).default(2),
  ANALYSIS_JOB_BACKOFF_MS: Joi.number().integer().min(100).default(2000),
  EXTENSION_TOKEN_MAX_AGE_SEC: Joi.number().integer().min(60).default(604800),
}).unknown(true);

let cached = null;

const loadConfig = () => {
  if (cached) {
    return cached;
  }

  const { value, error } = schema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    throw new Error(`Environment validation failed: ${error.details.map((d) => d.message).join('; ')}`);
  }

  if (value.NODE_ENV === 'production' && !value.JWT_SECRET) {
    throw new Error('Environment validation failed: JWT_SECRET is required in production');
  }

  cached = value;
  return cached;
};

const get = (key, fallback) => {
  const config = loadConfig();
  if (typeof config[key] === 'undefined') {
    return fallback;
  }
  return config[key];
};

const getAllowedOrigins = () => {
  const config = loadConfig();
  const base = [config.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  const extra = String(config.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set([...base, ...extra]));
};

const getAllowedExtensionIds = () => String(get('EXTENSION_ALLOWED_IDS', ''))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isProduction = () => get('NODE_ENV') === 'production';
const isDevelopment = () => get('NODE_ENV') === 'development';

module.exports = {
  loadConfig,
  get,
  isProduction,
  isDevelopment,
  getAllowedOrigins,
  getAllowedExtensionIds,
};
