const { askAI } = require('./aiService');

const buildSimplifyPrompt = (text) => {
  return [
    'You are a helpful assistant that rewrites legal text into plain, user-friendly English.',
    'Return the simplified version as a JSON array of short sentences (no markdown, no commentary).',
    '',
    'Input:',
    text,
    '',
    'Output JSON schema:',
    '["simplified sentence 1","simplified sentence 2"]',
  ].join('\n');
};

const simplifyText = async (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const prompt = buildSimplifyPrompt(text);

  try {
    const raw = await askAI(prompt);
    // Try parse JSON directly or extract JSON block
    if (typeof raw === 'object' && raw !== null) {
      return Array.isArray(raw) ? raw : [];
    }

    try {
      return JSON.parse(raw);
    } catch (err) {
      const m = raw.match(/\[([\s\S]*)\]/);
      if (m) {
        try {
          return JSON.parse(m[0]);
        } catch (_e) {
          // fall through to fallback
        }
      }
    }
  } catch (err) {
    // fallback to rule-based simplification below
  }

  // Fallback: naive sentence splitting + light rewrite rules
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[\.\?\!])\s+/)
    .slice(0, 6)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // quick replacements
      return s
        .replace(/We may share your personal data with/gi, 'Your data may be shared with')
        .replace(/We may share data with/gi, 'Your data may be shared with')
        .replace(/third[-\s]?party/gi, 'other companies')
        .replace(/unless cancelled?/gi, 'unless you cancel')
        .replace(/auto[-\s]?renew(?:al|s|ed|)?/gi, 'auto-renew');
    });

  return sentences.length ? sentences : [text];
};

module.exports = {
  simplifyText,
};
