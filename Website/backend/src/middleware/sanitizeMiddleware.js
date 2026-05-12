const sanitizeObject = (input) => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item));
  }

  const clean = {};

  for (const [rawKey, value] of Object.entries(input)) {
    const key = String(rawKey)
      .replace(/\$/g, '')
      .replace(/\./g, '_')
      .trim();

    if (!key) {
      continue;
    }

    clean[key] = sanitizeObject(value);
  }

  return clean;
};

const sanitizeRequestMiddleware = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = {
  sanitizeRequestMiddleware,
  sanitizeObject,
};
