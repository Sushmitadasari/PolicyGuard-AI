const { askAI: providerAskAI } = require('../ai/aiProvider');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (message = '') => {
  const text = String(message || '').toLowerCase();
  return text.includes('rate limit') || text.includes('rate_limit_exceeded') || text.includes('too many requests');
};

const extractRetryDelayMs = (message = '') => {
  const text = String(message || '');

  const secondsMatch = text.match(/try again in\s*([0-9]+(?:\.[0-9]+)?)\s*s/i);
  if (secondsMatch?.[1]) {
    return Math.ceil(Number.parseFloat(secondsMatch[1]) * 1000);
  }

  const msMatch = text.match(/try again in\s*([0-9]+(?:\.[0-9]+)?)\s*ms/i);
  if (msMatch?.[1]) {
    return Math.ceil(Number.parseFloat(msMatch[1]));
  }

  return null;
};

const askAI = async (prompt, options = {}) => {
  const maxAttempts = Number.isFinite(options.maxAttempts) ? options.maxAttempts : 4;
  const baseBackoffMs = Number.isFinite(options.baseBackoffMs) ? options.baseBackoffMs : 800;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const resp = await providerAskAI(prompt);
      return resp;
    } catch (err) {
      lastError = err;
      const message = err?.message || '';
      const shouldRetry = isRateLimitError(message) && attempt < maxAttempts;

      if (!shouldRetry) {
        throw new Error(`AI Service Error: ${message}`);
      }

      const hintedDelay = extractRetryDelayMs(message);
      const exponentialDelay = baseBackoffMs * (2 ** (attempt - 1));
      const delayMs = Math.min(
        Math.max(hintedDelay || exponentialDelay, 250),
        10000
      );

      await sleep(delayMs);
    }
  }

  throw new Error(`AI Service Error: ${lastError?.message || 'Unknown AI provider error'}`);
};

module.exports = {
  askAI,
};
