const MAX_TURNS = 12;
const { cacheManager } = require('../services/cacheManager');

const sessions = new Map();

const buildEmptySession = (key) => ({
  sessionId: key,
  turns: [],
  lastMode: '',
  lastContext: null,
  lastAnalysis: null,
  lastDocument: null,
  lastAnalysisContext: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const getSession = (sessionId = 'default') => {
  const key = String(sessionId || 'default');

  if (!sessions.has(key)) {
    sessions.set(key, buildEmptySession(key));
  }

  return sessions.get(key);
};

const persistSession = async (sessionId) => {
  const key = String(sessionId || 'default');
  const session = sessions.get(key);
  if (!session) {
    return;
  }

  try {
    await cacheManager.set(
      ['chatbot', 'session', key],
      session,
      cacheManager.cacheTTL.chatbotSession()
    );
  } catch (_error) {
    // Fallback to in-memory only when cache persistence fails.
  }
};

const hydrateSession = async (sessionId = 'default') => {
  const key = String(sessionId || 'default');
  if (sessions.has(key)) {
    return sessions.get(key);
  }

  let cached = null;
  try {
    cached = await cacheManager.get(['chatbot', 'session', key]);
  } catch (_error) {
    cached = null;
  }
  if (cached && typeof cached === 'object') {
    sessions.set(key, {
      ...buildEmptySession(key),
      ...cached,
      sessionId: key,
    });
    return sessions.get(key);
  }

  sessions.set(key, buildEmptySession(key));
  return sessions.get(key);
};

const appendTurn = (sessionId, turn) => {
  const session = getSession(sessionId);
  const normalizedTurn = {
    role: turn?.role === 'assistant' ? 'assistant' : 'user',
    message: typeof turn?.message === 'string' ? turn.message.trim() : '',
    reply: typeof turn?.reply === 'string' ? turn.reply.trim() : '',
    mode: typeof turn?.mode === 'string' ? turn.mode : session.lastMode,
    createdAt: new Date().toISOString(),
  };

  session.turns.push(normalizedTurn);
  session.turns = session.turns.slice(-MAX_TURNS);
  session.lastMode = normalizedTurn.mode || session.lastMode;
  session.updatedAt = new Date().toISOString();

  if (turn?.context) {
    session.lastContext = turn.context;
  }

  if (turn?.analysis) {
    session.lastAnalysis = turn.analysis;
  }

  if (turn?.document) {
    session.lastDocument = turn.document;

    if (turn?.analysisContext) {
      session.lastAnalysisContext = turn.analysisContext;
    }
  }

  void persistSession(sessionId);

  return session;
};

const setSessionContext = (sessionId, context = {}) => {
  const session = getSession(sessionId);
  session.lastContext = context;
  session.lastMode = typeof context.mode === 'string' ? context.mode : session.lastMode;
  session.updatedAt = new Date().toISOString();
  void persistSession(sessionId);
  return session;
};

const getRecentTurns = (sessionId, limit = 6) => {
  const session = getSession(sessionId);
  return session.turns.slice(-Math.max(1, Math.min(limit, MAX_TURNS)));
};

const getLastContext = (sessionId) => getSession(sessionId).lastContext;

module.exports = {
  getSession,
  hydrateSession,
  appendTurn,
  setSessionContext,
  getRecentTurns,
  getLastContext,
};
