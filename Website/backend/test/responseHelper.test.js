const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildFrontendAnalysisResponse,
  normalizeHistoryRecord,
  buildDashboardStats,
} = require('../src/utils/responseHelper');

test('buildFrontendAnalysisResponse includes confidence and clauses', () => {
  const response = buildFrontendAnalysisResponse({
    summary: 'Potential policy risk detected.',
    riskScore: 8,
    riskLevel: 'High',
    risks: ['Third-party data sharing'],
    simplified: ['Your data may be shared with advertisers.'],
    clauses: [
      {
        clause: 'We share your personal data with third-party advertisers.',
        type: 'data-sharing',
        severity: 'High',
        explanation: 'Third-party data sharing',
      },
    ],
  }, {
    filename: 'policy.pdf',
    analysisTimeMs: 123,
    chunkCount: 2,
  });

  assert.equal(response.success, true);
  assert.equal(response.analysis.confidence >= 0, true);
  assert.equal(response.analysis.clauses.length, 1);
  assert.equal(response.metadata.filename, 'policy.pdf');
  assert.equal(response.metadata.analysisTimeMs, 123);
  assert.equal(response.metadata.chunkCount, 2);
});

test('normalizeHistoryRecord maps history fields for frontend display', () => {
  const record = normalizeHistoryRecord({
    _id: '123',
    fileName: 'contract.pdf',
    analysisType: 'PDF',
    summary: 'Summary',
    riskScore: 8,
    riskLevel: 'High',
    confidence: 91,
    risks: ['Third-party data sharing'],
    simplified: ['Readable text'],
    clauses: [
      { clause: 'Clause text', type: 'data-sharing', severity: 'High', explanation: 'Risk' },
    ],
    createdAt: new Date('2026-05-08T10:00:00Z'),
  });

  assert.equal(record.fileName, 'contract.pdf');
  assert.equal(record.confidence, 91);
  assert.equal(record.clauses.length, 1);
  assert.equal(record.analysisType, 'PDF');
});

test('buildDashboardStats summarizes history records', () => {
  const stats = buildDashboardStats([
    {
      _id: '1',
      fileName: 'a.pdf',
      analysisType: 'PDF',
      summary: 'A',
      riskScore: 8,
      riskLevel: 'High',
      confidence: 90,
      risks: [],
      simplified: [],
      clauses: [],
    },
    {
      _id: '2',
      fileName: 'b.pdf',
      analysisType: 'PDF',
      summary: 'B',
      riskScore: 4,
      riskLevel: 'Medium',
      confidence: 70,
      risks: [],
      simplified: [],
      clauses: [],
    },
  ]);

  assert.equal(stats.totalAnalyses, 2);
  assert.equal(stats.averageRiskScore, 6);
  assert.equal(stats.averageConfidence, 80);
  assert.equal(stats.riskLevelBreakdown.High, 1);
  assert.equal(stats.riskLevelBreakdown.Medium, 1);
});
