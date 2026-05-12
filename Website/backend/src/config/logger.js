const pino = require('pino');
const pinoHttp = require('pino-http');
const config = require('./centralConfig');

const logger = pino({
  level: config.get('LOG_LEVEL', 'info'),
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

const requestLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'silent';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

const withTimer = async (name, fn, extra = {}) => {
  const start = Date.now();
  try {
    const result = await fn();
    logger.info({ event: 'performance', name, durationMs: Date.now() - start, ...extra });
    return result;
  } catch (error) {
    logger.error({ event: 'performance', name, durationMs: Date.now() - start, ...extra, error: error.message });
    throw error;
  }
};

module.exports = {
  logger,
  requestLogger,
  withTimer,
};
