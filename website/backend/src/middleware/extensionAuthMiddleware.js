const jwt = require('jsonwebtoken');
const config = require('../config/centralConfig');

const getBearerToken = (header = '') => {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return '';
  }
  return header.slice(7).trim();
};

const parseChromeExtensionId = (origin = '') => {
  if (typeof origin !== 'string') return '';
  const match = origin.match(/^chrome-extension:\/\/([a-z]{32})$/i);
  return match?.[1] || '';
};

const verifyExtensionAuth = (req, res, next) => {
  const source = String(req.body?.source || '').toLowerCase();
  if (source !== 'extension') {
    return next();
  }

  const token = getBearerToken(req.headers.authorization || '');

  // Allow quick, non-persistent extension analysis without JWT.
  // This keeps the thin-client quick scan flow working while preserving
  // JWT requirements for any user-bound/persistent extension operations.
  if (!token) {
    const mode = String(req.body?.mode || '').toLowerCase();
    const persist = req.body?.options?.persist === true;
    const consent = req.body?.options?.consent === true;

    if (mode === 'quick' && !persist && !consent) {
      return next();
    }

    return res.status(401).json({ success: false, error: 'Extension token is required', statusCode: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || '');
    const issuedAtSec = Number(payload.iat || 0);
    const maxAgeSec = config.get('EXTENSION_TOKEN_MAX_AGE_SEC', 604800);

    if (issuedAtSec && Math.floor(Date.now() / 1000) - issuedAtSec > maxAgeSec) {
      return res.status(401).json({ success: false, error: 'Extension token expired', statusCode: 401 });
    }

    const allowedIds = config.getAllowedExtensionIds();
    const origin = req.headers.origin || '';
    const extensionId = parseChromeExtensionId(origin);

    if (allowedIds.length > 0 && extensionId && !allowedIds.includes(extensionId)) {
      return res.status(403).json({ success: false, error: 'Extension origin is not allowed', statusCode: 403 });
    }

    req.extensionUser = { id: payload.id || '', email: payload.email || '' };
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, error: 'Invalid extension token', statusCode: 401 });
  }
};

module.exports = {
  verifyExtensionAuth,
};
