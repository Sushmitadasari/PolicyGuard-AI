const test = require('node:test');
const assert = require('node:assert/strict');

const { determineIntent } = require('../src/chatbot/intentDetector');
const { getSession, appendTurn, getRecentTurns, setSessionContext } = require('../src/chatbot/conversationMemory');
const { buildChatbotPrompt } = require('../src/chatbot/chatbotPrompts');

test('intent detector identifies PDF follow-up questions', () => {
  const intent = determineIntent('Why is this clause risky?', { lastMode: 'pdf', lastContext: { record: true } });

  assert.equal(intent.mode, 'pdf');
  assert.equal(intent.isFollowUp, true);
});

test('intent detector identifies platform score questions', () => {
  const intent = determineIntent('Explain the risk score and confidence meter');

  assert.equal(intent.mode, 'platform');
});

test('conversation memory stores follow-up turns per session', () => {
  const sessionId = 'chatbot-test-session';
  const session = getSession(sessionId);
  assert.equal(session.sessionId, sessionId);

  setSessionContext(sessionId, {
    mode: 'pdf',
    record: {
      fileName: 'sample.pdf',
      summary: 'A risky clause was detected.',
      riskScore: 8,
      riskLevel: 'High',
      confidence: 95,
      risks: ['Third-party data sharing'],
      clauses: [],
    },
  });

  appendTurn(sessionId, {
    role: 'user',
    message: 'Why is this clause risky?',
    mode: 'pdf',
  });

  appendTurn(sessionId, {
    role: 'assistant',
    message: 'Why is this clause risky?',
    reply: 'It shares data with third parties.',
    mode: 'pdf',
  });

  const turns = getRecentTurns(sessionId, 2);
  assert.equal(turns.length, 2);
  assert.equal(turns[1].reply, 'It shares data with third parties.');
});

test('chatbot prompt includes memory and context', () => {
  const prompt = buildChatbotPrompt({
    message: 'Explain it more simply',
    intent: { mode: 'pdf', confidence: 87 },
    context: {
      documentSummary: 'File: sample.pdf | Summary: risky clause found.',
      analysisSummary: 'Risk score: 8 | Risk level: High',
      clausesSummary: 'data-sharing: We share data',
      relevantFacts: 'User asked about a clause',
    },
    memory: {
      summary: 'Previous document discussed',
      recentTurnsSummary: 'U: Why is this clause risky? | A: It shares data',
    },
  });

  assert.match(prompt, /Mode: pdf/i);
  assert.match(prompt, /Previous document discussed/i);
  assert.match(prompt, /sample\.pdf/i);
  assert.match(prompt, /Why is this clause risky\?/i);
});
