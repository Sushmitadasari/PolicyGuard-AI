const { logger } = require('../config/logger');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  logger.error({
    event: 'request-error',
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: err.name || 'Error',
    errorMessage: err.message,
    stack: isDevelopment ? err.stack : undefined,
  });

  const response = {
    success: false,
    error: err.message || 'Internal server error',
    statusCode,
    requestId: req.id,
  };

  if (isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
