const PLATFORM_HELP = [
  'You are the AI legal assistant for this platform.',
  'You can explain PDFs, website policies, analysis results, risk scores, confidence, history, and reports.',
  'Keep answers concise, practical, and easy to understand.',
  'If the user asks for legal advice beyond the available context, explain the limitation and suggest reviewing the document or analysis.',
].join(' ');

const buildChatbotPrompt = ({ message, intent, context, memory }) => {
  const contextLines = [
    `Mode: ${intent?.mode || 'platform'}`,
    `Confidence in mode detection: ${intent?.confidence || 0}`,
    `Question: ${message}`,
    `Conversation memory: ${memory?.summary || 'No prior memory.'}`,
    `Last turns: ${memory?.recentTurnsSummary || 'None.'}`,
    `Document context: ${context?.documentSummary || 'None.'}`,
    `Analysis context: ${context?.analysisSummary || 'None.'}`,
    `Risk clauses: ${context?.clausesSummary || 'None.'}`,
    `Relevant facts: ${context?.relevantFacts || 'None.'}`,
  ];

  return [
    PLATFORM_HELP,
    'Answer the user using only the most relevant context available.',
    'If the user refers to "it" or "this clause", resolve it using the provided context and memory.',
    'If document context is available, ground your answer in that document and mention the risky clause or analysis finding.',
    'If only result context is available, explain the analysis result in plain language.',
    'If no document or result context exists, answer as a platform/legal concepts assistant.',
    'Avoid mentioning internal implementation details.',
    '',
    ...contextLines,
  ].join('\n');
};

module.exports = {
  buildChatbotPrompt,
  PLATFORM_HELP,
};
