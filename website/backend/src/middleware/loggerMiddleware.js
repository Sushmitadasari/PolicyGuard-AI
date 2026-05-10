const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const logLevel = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    const timestamp = new Date().toISOString();

    console.log(
      `${timestamp} [${logLevel}] ${method} ${url} | Status: ${statusCode} | IP: ${ip} | Duration: ${duration}ms`
    );
  });

  next();
};

module.exports = loggerMiddleware;
