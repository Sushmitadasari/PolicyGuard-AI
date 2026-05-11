const rateLimit = require('express-rate-limit');
const config = require('../config/centralConfig');

const createJsonHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    error: message,
    statusCode: 429,
    retryAfterMs: config.get('RATE_LIMIT_WINDOW_MS', 60000),
  });
};

const baseConfig = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  windowMs: config.get('RATE_LIMIT_WINDOW_MS', 60000),
};

const authLimiter = rateLimit({
  ...baseConfig,
  max: config.get('RATE_LIMIT_AUTH_MAX', 10),
  handler: createJsonHandler('Too many authentication requests. Please try again later.'),
});

const analysisLimiter = rateLimit({
  ...baseConfig,
  max: config.get('RATE_LIMIT_ANALYSIS_MAX', 30),
  handler: createJsonHandler('Too many analysis requests. Please retry shortly.'),
});

const chatbotLimiter = rateLimit({
  ...baseConfig,
  max: config.get('RATE_LIMIT_CHATBOT_MAX', 60),
  handler: createJsonHandler('Too many chatbot messages. Please slow down and retry.'),
});

const apiLimiter = rateLimit({
  ...baseConfig,
  max: config.get('RATE_LIMIT_GENERAL_MAX', 180),
  handler: createJsonHandler('Too many requests. Please try again later.'),
});

module.exports = {
  authLimiter,
  analysisLimiter,
  chatbotLimiter,
  apiLimiter,
};
