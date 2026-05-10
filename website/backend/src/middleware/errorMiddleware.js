const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  console.error(
    `[ERROR] ${err.name || 'Error'}: ${err.message}\n${isDevelopment ? err.stack : ''}`
  );

  const response = {
    error: err.message || 'Internal server error',
    statusCode,
  };

  if (isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
