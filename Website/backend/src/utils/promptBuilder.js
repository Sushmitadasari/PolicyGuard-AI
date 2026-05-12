const buildPolicyAnalysisPrompt = (policyText) => {
  return [
    'You are a legal policy analysis assistant.',
    'Analyze the input policy text and return ONLY valid JSON.',
    'Do not include markdown, code fences, or extra commentary.',
    'If uncertain, still return the exact schema with empty fallback values.',
    '',
    'Required JSON schema:',
    '{',
    '  "summary": "string",',
    '  "risks": ["string"],',
    '  "riskLevel": "Low | Medium | High",',
    '  "simplified": ["string"]',
    '}',
    '',
    'Fallback schema (if no confident findings):',
    '{',
    '  "summary": "",',
    '  "risks": [],',
    '  "riskLevel": "",',
    '  "simplified": []',
    '}',
    '',
    'Rules:',
    '- summary: 2-4 sentences.',
    '- risks: specific risk clauses detected in the policy.',
    '- riskLevel: choose one from Low, Medium, High.',
    '- simplified: 3-6 plain-English bullet-style sentences as array items.',
    '',
    'Policy text to analyze:',
    policyText,
  ].join('\n');
};

module.exports = {
  buildPolicyAnalysisPrompt,
};
