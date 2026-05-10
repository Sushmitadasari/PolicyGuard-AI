const { askAI } = require('./aiService');
const { determineIntent } = require('../chatbot/intentDetector');
const { buildContext } = require('../chatbot/contextBuilder');
const { buildChatbotPrompt } = require('../chatbot/chatbotPrompts');
const { appendTurn, getSession, getRecentTurns } = require('../chatbot/conversationMemory');

const cleanReply = (reply) => {
  if (typeof reply !== 'string') {
    return '';
  }

  return reply.trim();
};

const chat = async ({ message, sessionId = 'default', analysisId = '', documentName = '' }) => {
  // load session memory and pass into intent detector
  const session = getSession(sessionId);
  const memory = {
    lastMode: session.lastMode,
    lastContext: session.lastContext,
    lastAnalysis: session.lastAnalysis,
    lastDocument: session.lastDocument,
    recentTurns: getRecentTurns(sessionId),
  };

  const intent = determineIntent(message, memory);

  let context = {};

  if (intent.mode === 'result') {
    context = await buildContext({
      message,
      sessionId,
      analysisId,
      mode: intent.mode,
    });
  } else if (intent.mode === 'legal') {
    context = {
      conversationSummary: {
        lastContext: {
          analysisSummary: 'You are explaining legal/privacy concepts simply.',
        },
        recentTurnsSummary: 'None.',
      },
      record: null,
      source: 'legal',
    };
  } else {
    // platform (default)
    context = {
      conversationSummary: {
        lastContext: {
          analysisSummary:
            'PolicyGuard AI is an AI privacy analysis platform. Features: PDF Analyzer, Website Analyzer, AI Risk Detection, Clause Detection, Dashboard, Reports, Contextual AI Chatbot.',
        },
        recentTurnsSummary: 'None.',
      },
      record: null,
      source: 'platform',
    };
  }

  const prompt = buildChatbotPrompt({
    message,
    intent,
    context,
    memory: {
      summary: context.conversationSummary?.lastContext?.analysisSummary || 'No prior memory.',
      recentTurnsSummary: context.conversationSummary?.recentTurnsSummary || 'None.',
    },
  });

  let reply = '';
  try {
    reply = cleanReply(await askAI(prompt));
  } catch (error) {
    reply = 'I could not generate a response right now. Please try again.';
  }

  if (!reply) {
    reply = 'I could not generate a response right now. Please try again.';
  }

  appendTurn(sessionId, {
    role: 'user',
    message,
    mode: intent.mode,
    context,
  });

  appendTurn(sessionId, {
    role: 'assistant',
    message,
    reply,
    mode: intent.mode,
    context,
    document: context.record || null,
    analysis: context.record || null,
  });

  return {
    reply,
    mode: intent.mode,
    sessionId,
    intent,
    context,
  };
};

module.exports = {
  chat,
};