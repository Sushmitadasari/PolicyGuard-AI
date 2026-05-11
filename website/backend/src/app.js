const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const crypto = require('crypto');
const config = require('./config/centralConfig');
const { requestLogger } = require('./config/logger');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const { sanitizeRequestMiddleware } = require('./middleware/sanitizeMiddleware');
const { apiLimiter, authLimiter, analysisLimiter, chatbotLimiter } = require('./middleware/rateLimitMiddleware');
const { verifyExtensionAuth } = require('./middleware/extensionAuthMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const apiV1Routes = require('./routes/apiV1Routes');
const pdfRoutes = require('./routes/pdfRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const historyRoutes = require('./routes/historyRoutes');
const cacheRoutes = require('./routes/cacheRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { isDatabaseConnected, getDatabaseConnectionError } = require('./config/db');

const app = express();

app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(compression());

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }

    const allowed = config.getAllowedOrigins();
    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
}));

app.use(express.json({ limit: config.get('MAX_REQUEST_SIZE', '5mb') }));
app.use(express.urlencoded({ extended: true, limit: config.get('MAX_REQUEST_SIZE', '5mb') }));
app.use(sanitizeRequestMiddleware);

app.use((req, res, next) => {
  const defaultTimeoutMs = config.get('REQUEST_TIMEOUT_MS', 30000);
  const analysisTimeoutMs = config.get('ANALYSIS_REQUEST_TIMEOUT_MS', 120000);
  const url = String(req.originalUrl || req.url || '');
  const isAnalyzeRequest = req.method === 'POST' && (
    url.includes('/api/v1/analyze') ||
    url.includes('/analyze') ||
    url.includes('/website')
  );

  const timeoutMs = isAnalyzeRequest ? analysisTimeoutMs : defaultTimeoutMs;
  req.setTimeout(timeoutMs);
  res.setTimeout(timeoutMs);
  next();
});

app.use(requestLogger);
app.use(loggerMiddleware);
app.use(apiLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API running',
  });
});

app.get('/health/db', (req, res) => {
  const error = getDatabaseConnectionError();

  res.status(200).json({
    connected: isDatabaseConnected(),
    status: isDatabaseConnected() ? 'connected' : 'disconnected',
    error: error ? error.message : null,
  });
});

app.get('/health/cache', async (_req, res) => {
  const { cacheManager } = require('./services/cacheManager');
  const health = await cacheManager.health();

  return res.status(200).json({
    success: true,
    cache: health,
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', authLimiter, authRoutes);
app.use('/', chatRoutes);
app.use('/chatbot', chatbotLimiter, chatbotRoutes);
app.use('/api/v1', analysisLimiter, verifyExtensionAuth, apiV1Routes);
app.use('/', analysisLimiter, analyzeRoutes);
app.use('/pdf', analysisLimiter, pdfRoutes);
app.use('/website', analysisLimiter, websiteRoutes);
app.use('/history', historyRoutes);
app.use('/cache', cacheRoutes);
app.use('/reports', reportRoutes);

app.use(errorMiddleware);

module.exports = app;
