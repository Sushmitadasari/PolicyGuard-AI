const { getAnalysisHistory, getAnalysisHistoryById } = require('../services/historyService');
const { normalizeHistoryRecord } = require('../utils/responseHelper');
const { getSession, getLastContext, getRecentTurns, setSessionContext } = require('./conversationMemory');

const MAX_HISTORY_LOOKUP = 25;

const cleanText = (text, maxLength = 400) => {
  if (typeof text !== 'string') {
    return '';
  }

  return text.replace(/\s+/g, ' ').trim().slice(0, maxLength);
};

const summarizeTurns = (turns = []) => {
  if (!Array.isArray(turns) || turns.length === 0) {
    return 'No prior turns.';
  }

  return turns.slice(-4).map((turn) => {
    if (turn.role === 'assistant') {
      return `A: ${cleanText(turn.reply, 140)}`;
    }

    return `U: ${cleanText(turn.message, 140)}`;
  }).join(' | ');
};

const getRelevantClauses = (record, message) => {
  if (!record || !Array.isArray(record.clauses)) {
    return [];
  }

  const normalizedMessage = typeof message === 'string' ? message.toLowerCase() : '';
  const keywords = normalizedMessage.split(/[^a-z0-9]+/).filter(Boolean);

  return record.clauses
    .map((clause) => ({
      ...clause,
      _score: keywords.reduce((score, keyword) => score + (clause.clause.toLowerCase().includes(keyword) ? 1 : 0), 0),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 3)
    .map(({ _score, ...clause }) => clause);
};

const pickLatestRecord = (records = [], preferredSources = []) => {
  if (!Array.isArray(records) || records.length === 0) {
    return null;
  }

  if (!Array.isArray(preferredSources) || preferredSources.length === 0) {
    return normalizeHistoryRecord(records[0]);
  }

  const preferred = records.find((record) => preferredSources.includes(record.source));
  return normalizeHistoryRecord(preferred || records[0]);
};

const buildConversationSummary = (sessionId) => {
  const session = getSession(sessionId);
  return {
    sessionId: session.sessionId,
    lastMode: session.lastMode,
    recentTurnsSummary: summarizeTurns(getRecentTurns(sessionId, 6)),
    lastContext: session.lastContext,
  };
};

const buildContextFromRecord = (record, message) => {
  if (!record) {
    return {
      documentSummary: 'No document context found.',
      analysisSummary: 'No analysis context found.',
      clausesSummary: 'None.',
      relevantFacts: 'None.',
      clauses: [],
      record: null,
    };
  }

  const relevantClauses = getRelevantClauses(record, message);
  const documentSummary = [
    record.fileName ? `File: ${record.fileName}` : '',
    record.source ? `Source: ${record.source}` : '',
    record.summary ? `Summary: ${cleanText(record.summary, 500)}` : '',
  ].filter(Boolean).join(' | ');

  const analysisSummary = [
    `Risk score: ${record.riskScore}`,
    `Risk level: ${record.riskLevel || 'Unknown'}`,
    `Confidence: ${record.confidence || 0}`,
    record.risks?.length ? `Risks: ${record.risks.join('; ')}` : '',
  ].filter(Boolean).join(' | ');

  return {
    documentSummary: documentSummary || 'No document summary available.',
    analysisSummary: analysisSummary || 'No analysis summary available.',
    clausesSummary: relevantClauses.length ? relevantClauses.map((clause) => `${clause.type || 'clause'}: ${cleanText(clause.clause, 180)}`).join(' | ') : 'None.',
    relevantFacts: record.policyText ? cleanText(record.policyText, 700) : 'None.',
    clauses: relevantClauses,
    record,
  };
};

const buildPlatformContext = (message) => ({
  documentSummary: 'No document context required.',
  analysisSummary: 'No analysis result referenced.',
  clausesSummary: 'None.',
  relevantFacts: `User asked about platform or legal concepts: ${cleanText(message, 250)}`,
  clauses: [],
  record: null,
});

const buildContext = async ({ message, sessionId = 'default', analysisId = '', documentName = '', mode = 'platform' }) => {
  const session = getSession(sessionId);
  const priorContext = getLastContext(sessionId);
  const conversationSummary = buildConversationSummary(sessionId);

  if (mode === 'platform') {
    const context = {
      mode,
      sessionId,
      conversationSummary,
      ...buildPlatformContext(message),
      source: 'platform',
    };

    setSessionContext(sessionId, context);
    return context;
  }

  if (priorContext && priorContext.record && !analysisId) {
    const context = {
      mode,
      sessionId,
      conversationSummary,
      ...priorContext,
      source: priorContext.source || 'memory',
    };

    setSessionContext(sessionId, context);
    return context;
  }

  let record = null;

  if (analysisId) {
    const fetched = await getAnalysisHistoryById(analysisId);
    record = normalizeHistoryRecord(fetched);
  } else {
    const history = await getAnalysisHistory({ limit: MAX_HISTORY_LOOKUP });
    const normalizedHistory = history.map(normalizeHistoryRecord).filter(Boolean);

    if (documentName) {
      const normalizedName = documentName.toLowerCase().trim();
      const namedRecord = normalizedHistory.find((item) =>
        item.fileName.toLowerCase() === normalizedName || item.documentName.toLowerCase() === normalizedName
      );

      if (namedRecord) {
        record = namedRecord;
      }
    }

    if (!record && mode === 'pdf') {
      record = pickLatestRecord(normalizedHistory, ['pdf', 'website']);
    } else if (!record && mode === 'result') {
      record = pickLatestRecord(normalizedHistory, ['analyze', 'pdf', 'website']);
    } else if (!record) {
      record = pickLatestRecord(normalizedHistory, ['pdf', 'analyze', 'website']);
    }
  }

  const context = {
    mode,
    sessionId,
    conversationSummary,
    ...buildContextFromRecord(record, message),
    source: record?.source || 'history',
  };

  if (!context.record && session.lastContext) {
    context.record = session.lastContext.record || null;
  }

  setSessionContext(sessionId, context);
  return context;
};

module.exports = {
  buildContext,
  buildContextFromRecord,
  buildPlatformContext,
};
