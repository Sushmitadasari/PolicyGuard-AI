const detectKeywords = (text, keywords) => {
  const normalized = String(text || '').toLowerCase();
  return keywords.reduce((s, k) => (normalized.includes(k) ? s + 1 : s), 0);
};

// Narrow RESULT triggers to avoid catching general legal/platform queries
const resultKeywords = [
  'clause',
  'this document',
  'this policy',
  'detected issue',
  'this risk',
  'explain this result',
  'uploaded file',
  'uploaded pdf',
  'risk score',
  'confidence score',
  'confidence meter',
  'explain this clause',
  'explain the clause',
  'explain detected risks',
  'explain this risk',
  'summarize',
  'summary of',
  'is this dangerous',
  'is this risky',
  'is it safe',
  'is this policy safe',
  'dangerous',
  'risky',
  'what risks',
  'what clauses',
  'what tracking',
  'what sharing',
  'detection',
  'detected in',
  'found in',
  'concerns',
  'recommendations',
];

const legalKeywords = [
  'gdpr',
  'cookies',
  'privacy',
  'privacy policy',
  'compliance',
  'legal',
  'law',
  'consent',
  'user rights',
  'personal information',
  'personal data',
  'advertisers',
  'tracking',
  'retention',
  'data collection',
];

const platformKeywords = [
  'policyguard',
  'platform',
  'analyzer',
  'website analyzer',
  'pdf analyzer',
  'chatbot',
  'dashboard',
  'reports',
  // keep platform keywords focused on product terms (no risk/confidence phrases)
  'feature',
  'upload',
  'scan',
  'analysis system',
  'ai system',
];

const followUpKeywords = [
  'it',
  'this',
  'that',
  'more simply',
  'simpler',
  'again',
  'explain more',
  'what about',
  'why',
  'how so',
];

const determineIntent = (message = '', memory = {}) => {
  const lower = String(message).toLowerCase();

  // STEP 1: hard platform isolation (ignore memory/follow-up/context)
  const hardPlatformKeywords = [
    'policyguard',
    'platform',
    'website analyzer',
    'pdf analyzer',
    'chatbot',
    'dashboard',
    'reports',
    'risk score',
    'confidence score',
    'analysis system',
  ];

  const hardPlatformScore = detectKeywords(lower, hardPlatformKeywords);
  if (hardPlatformScore > 0) {
    console.log('Intent Scores:', { platformScore: hardPlatformScore, legalScore: 0, resultScore: 0 });
    return {
      mode: 'platform',
      confidence: 95,
      signals: { resultScore: 0, legalScore: 0, platformScore: hardPlatformScore, followUpScore: 0 },
      isFollowUp: false,
    };
  }

  // STEP 2: hard legal isolation (ignore memory/follow-up/context)
  const hardLegalKeywords = [
    'gdpr',
    'cookies',
    'privacy',
    'consent',
    'personal data',
    'tracking',
    'advertisers',
    'compliance',
    'privacy rights',
    'legal',
  ];

  const hardLegalScore = detectKeywords(lower, hardLegalKeywords);
  if (hardLegalScore > 0) {
    console.log('Intent Scores:', { platformScore: 0, legalScore: hardLegalScore, resultScore: 0 });
    return {
      mode: 'legal',
      confidence: 95,
      signals: { resultScore: 0, legalScore: hardLegalScore, platformScore: 0, followUpScore: 0 },
      isFollowUp: false,
    };
  }

  // STEP 3: evaluate result/pdf and memory-aware follow-up behavior

  let resultScore = detectKeywords(lower, resultKeywords);
  let legalScore = detectKeywords(lower, legalKeywords);
  let platformScore = detectKeywords(lower, platformKeywords);
  let followUpScore = detectKeywords(lower, followUpKeywords);

  const memoryMode = typeof memory.lastMode === 'string' ? memory.lastMode : '';
  const hasRecentContext = Boolean(memory.lastContext || memory.lastAnalysis || memory.lastDocument || memory.record);

  // Priority rules: platform > legal > result when explicit keywords present
  let mode = 'platform';

  if (platformScore >= legalScore && platformScore >= resultScore && platformScore > 0) {
    mode = 'platform';
  }

  if (legalScore >= resultScore && legalScore > 0) {
    mode = 'legal';
  }

  if (resultScore > 0) {
    mode = 'result';
  }

  // follow-ups should retain recent context when available
  if (followUpScore > 0 && hasRecentContext) {
    mode = memoryMode || mode;
  }

  // explicit PDF follow-up phrasing
  if ((lower.includes('why is this clause risky') || lower.includes('why is it risky')) && hasRecentContext) {
    mode = 'pdf';
  }

  const confidence = Math.min(100, 45 + (resultScore * 10) + (legalScore * 8) + (platformScore * 6) + (followUpScore * 5));

  // Debug logging for intent tuning
  try {
    console.log('Intent Scores:', { platformScore, legalScore, resultScore });
  } catch (e) {
    // ignore logging errors
  }

  return {
    mode,
    confidence,
    signals: { resultScore, legalScore, platformScore, followUpScore },
    isFollowUp: followUpScore > 0,
  };
};

module.exports = {
  determineIntent,
};
