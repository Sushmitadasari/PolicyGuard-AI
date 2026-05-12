/**
 * Text Chunking Service
 * Splits large policy texts into manageable chunks for AI processing
 * Improves performance and token efficiency
 */

const CHUNK_SIZE = 1000; // characters per chunk
const OVERLAP = 100; // character overlap between chunks for context

/**
 * Split text into overlapping chunks
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Size of each chunk (default 1000)
 * @param {number} overlap - Overlap between chunks (default 100)
 * @returns {string[]} Array of text chunks
 */
const chunkText = (text, chunkSize = CHUNK_SIZE, overlap = OVERLAP) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }

  // If text is smaller than chunk size, return as single chunk
  if (trimmed.length <= chunkSize) {
    return [trimmed];
  }

  const chunks = [];
  let start = 0;

  while (start < trimmed.length) {
    const end = Math.min(start + chunkSize, trimmed.length);
    const chunk = trimmed.substring(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= trimmed.length) {
      break;
    }

    // Move start position, accounting for overlap while guaranteeing progress
    const nextStart = end - overlap;
    start = nextStart > start ? nextStart : end;
  }

  return chunks;
};

/**
 * Check if text requires chunking
 * @param {string} text - The text to check
 * @returns {boolean} True if text should be chunked
 */
const requiresChunking = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  return text.trim().length > CHUNK_SIZE * 2; // Chunk if > 2x chunk size
};

/**
 * Get optimal chunk size for text length
 * @param {number} textLength - Length of the text
 * @returns {number} Recommended chunk size
 */
const getOptimalChunkSize = (textLength) => {
  if (textLength < 2000) {
    return 1000;
  }

  if (textLength < 5000) {
    return 1500;
  }

  if (textLength < 10000) {
    return 2000;
  }

  return 2500;
};

/**
 * Merge chunks analysis results
 * Combines results from processing multiple chunks
 * @param {Array} chunkResults - Array of analysis results from each chunk
 * @returns {Object} Merged analysis result
 */
const mergeChunkResults = (chunkResults) => {
  if (!Array.isArray(chunkResults) || chunkResults.length === 0) {
    return {
      summary: '',
      risks: [],
      riskScore: 0,
      riskLevel: '',
      simplified: [],
    };
  }

  // If only one result, return it
  if (chunkResults.length === 1) {
    return chunkResults[0];
  }

  // Merge multiple chunk results
  const merged = {
    summary: '',
    risks: [],
    riskScore: 0,
    riskLevel: '',
    simplified: [],
  };

  // Merge summaries by combining first 1-2 from each chunk
  const summaries = chunkResults
    .filter((r) => r.summary && typeof r.summary === 'string')
    .map((r) => r.summary.substring(0, 200)) // Limit length of each
    .slice(0, 3); // Take up to 3 summaries
  merged.summary = summaries.join(' ');

  // Merge and deduplicate risks
  const riskSet = new Set();
  chunkResults.forEach((result) => {
    if (Array.isArray(result.risks)) {
      result.risks.forEach((risk) => {
        if (typeof risk === 'string') {
          riskSet.add(risk.toLowerCase());
        }
      });
    }
  });
  merged.risks = Array.from(riskSet).slice(0, 10); // Limit to 10 unique risks

  // Calculate average risk score
  const validScores = chunkResults
    .filter((r) => Number.isFinite(r.riskScore))
    .map((r) => r.riskScore);
  if (validScores.length > 0) {
    merged.riskScore = Math.round(
      validScores.reduce((a, b) => a + b, 0) / validScores.length
    );
  }

  // Determine highest risk level
  const riskLevelMap = { High: 3, Medium: 2, Low: 1, '': 0 };
  const levels = chunkResults
    .map((r) => r.riskLevel)
    .sort((a, b) => riskLevelMap[b] - riskLevelMap[a]);
  merged.riskLevel = levels[0] || '';

  // Merge simplified explanations (limit to 3)
  const simplified = [];
  chunkResults.forEach((result) => {
    if (Array.isArray(result.simplified)) {
      result.simplified.slice(0, 1).forEach((item) => {
        if (typeof item === 'string' && !simplified.includes(item)) {
          simplified.push(item);
        }
      });
    }
  });
  merged.simplified = simplified.slice(0, 3);

  return merged;
};

module.exports = {
  chunkText,
  requiresChunking,
  getOptimalChunkSize,
  mergeChunkResults,
  CHUNK_SIZE,
  OVERLAP,
};
