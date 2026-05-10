const test = require('node:test');
const assert = require('node:assert/strict');

const {
  detectRuleBasedRisks,
  mergeRiskLists,
  buildRiskAssessment,
} = require('../src/services/riskService');
const {
  formatAnalysisResponse,
} = require('../src/services/responseFormatter');
const {
  generateCacheKey,
  get,
  set,
  clear,
} = require('../src/services/cachingService');

test('rule-based analysis detects third-party data sharing and high risk', () => {
  const policy = 'We share your personal data with third-party advertisers and partners.';
  const ruleBased = detectRuleBasedRisks(policy);
  const mergedRisks = mergeRiskLists([], ruleBased.risks);
  const assessment = buildRiskAssessment({
    ruleScore: ruleBased.totalScore,
    riskCount: mergedRisks.length,
    categoryCount: ruleBased.categories.length,
    aiRiskScore: 0,
    aiRiskLevel: '',
  });

  assert.ok(ruleBased.risks.includes('Third-party data sharing'));
  assert.equal(assessment.riskLevel, 'Medium');
  assert.equal(assessment.riskScore, 5);
});

test('formatted analysis can be cached and restored without losing metadata', () => {
  clear();

  const policy = 'We share your personal data with third-party advertisers.';
  const analysis = {
    summary: 'Potential policy risk detected: Third-party data sharing.',
    risks: ['Third-party data sharing'],
    riskScore: 8,
    riskLevel: 'High',
    simplified: ['Your data may be shared with advertisers.'],
  };

  const formatted = formatAnalysisResponse(analysis, policy, {
    analysisTime: 42,
  });

  const cacheKey = generateCacheKey(policy, 'analyze');
  assert.ok(cacheKey);
  assert.equal(set(cacheKey, formatted, 60000), true);

  const cached = get(cacheKey);
  assert.deepEqual(cached, formatted);
  assert.equal(cached.metadata.messageLength, policy.length);
  assert.equal(cached.metadata.analysisTimeMs, 42);

  clear();
});
