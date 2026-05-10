/**
 * Response Formatter Service
 * Ensures consistent, well-structured response formatting across all endpoints
 */

/**
 * Format analysis response
 * @param {Object} analysis - The analysis result
 * @param {string} userMessage - Original user message/policy
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted response
 */
const formatAnalysisResponse = (analysis, userMessage, options = {}) => {
  const {
    includeMetadata = true,
    includeAnalysisTime = true,
    includeSources = false,
  } = options;

  const response = {
    analysis: normalizeAnalysis(analysis),
  };

  if (includeMetadata) {
    response.metadata = {
      messageLength: userMessage ? userMessage.length : 0,
      timestamp: new Date().toISOString(),
      riskAssessmentVersion: '1.0',
    };
  }

  if (includeAnalysisTime && options.analysisTime) {
    response.metadata = response.metadata || {};
    response.metadata.analysisTimeMs = options.analysisTime;
  }

  if (includeSources && options.sources) {
    response.sources = options.sources;
  }

  return response;
};

/**
 * Format chat response
 * @param {string} userMessage - The user's message
 * @param {Object} analysis - The analysis result
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted response
 */
const formatChatResponse = (userMessage, analysis, options = {}) => {
  return {
    userMessage,
    analysis: normalizeAnalysis(analysis),
    timestamp: new Date().toISOString(),
    responseId: generateResponseId(),
    ...(options.metadata && { metadata: options.metadata }),
  };
};

/**
 * Format history response
 * @param {Array} items - History items
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted response
 */
const formatHistoryResponse = (items, options = {}) => {
  const { includeMetadata = true } = options;

  const response = {
    items: Array.isArray(items) ? items : [],
    count: Array.isArray(items) ? items.length : 0,
  };

  if (includeMetadata) {
    response.metadata = {
      timestamp: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
    };
  }

  return response;
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted error
 */
const formatErrorResponse = (message, statusCode, options = {}) => {
  const { includeStack = false, stack = null, requestId = null } = options;

  const response = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  if (includeStack && stack) {
    response.stack = stack;
  }

  if (requestId) {
    response.requestId = requestId;
  }

  return response;
};

/**
 * Normalize analysis object to ensure consistency
 * @param {Object} analysis - The analysis object
 * @returns {Object} Normalized analysis
 */
const normalizeAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== 'object') {
    return getDefaultAnalysis();
  }

  return {
    summary: typeof analysis.summary === 'string' ? analysis.summary : '',
    risks: Array.isArray(analysis.risks)
      ? analysis.risks.filter((r) => typeof r === 'string')
      : [],
    riskScore: normalizeRiskScore(analysis.riskScore),
    riskLevel: normalizeRiskLevel(analysis.riskLevel),
    simplified: Array.isArray(analysis.simplified)
      ? analysis.simplified.filter((s) => typeof s === 'string')
      : [],
  };
};

/**
 * Get default analysis object
 * @returns {Object} Default analysis
 */
const getDefaultAnalysis = () => ({
  summary: '',
  risks: [],
  riskScore: 0,
  riskLevel: '',
  simplified: [],
});

/**
 * Normalize risk score to 0-10 range
 * @param {number} score - Risk score
 * @returns {number} Normalized score
 */
const normalizeRiskScore = (score) => {
  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score < 0) return 0;
  if (score > 10) return 10;

  return Math.round(score);
};

/**
 * Normalize risk level
 * @param {string} level - Risk level
 * @returns {string} Normalized level
 */
const normalizeRiskLevel = (level) => {
  const validLevels = ['Low', 'Medium', 'High'];

  if (typeof level !== 'string') {
    return '';
  }

  const trimmed = level.trim();
  return validLevels.includes(trimmed) ? trimmed : '';
};

/**
 * Generate unique response ID
 * @returns {string} Response ID
 */
const generateResponseId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format paginated response
 * @param {Array} items - Items to paginate
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 * @param {number} totalCount - Total items count
 * @returns {Object} Paginated response
 */
const formatPaginatedResponse = (items, page, pageSize, totalCount) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items: Array.isArray(items) ? items : [],
    pagination: {
      page,
      pageSize,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
    },
  };
};

module.exports = {
  formatAnalysisResponse,
  formatChatResponse,
  formatHistoryResponse,
  formatErrorResponse,
  normalizeAnalysis,
  getDefaultAnalysis,
  normalizeRiskScore,
  normalizeRiskLevel,
  generateResponseId,
  formatPaginatedResponse,
};
