const { chat } = require('../services/chatbotService');

const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, sessionId, analysisId, documentName } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const result = await chat({
      message,
      sessionId,
      analysisId,
      documentName,
    });

    return res.status(200).json({
      success: true,
      reply: result.reply,
      mode: result.mode,
      sessionId: result.sessionId,
      intent: result.intent,
      context: {
        documentSummary: result.context.documentSummary,
        analysisSummary: result.context.analysisSummary,
        clauses: result.context.clauses,
        source: result.context.source,
      },
      metadata: {
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant,
};