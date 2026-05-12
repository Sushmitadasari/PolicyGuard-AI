const { riskRules } = require('../constants/riskRules');
const { buildRiskAssessment } = require('../utils/riskCalculator');

const normalizeInput = (text) => {
  if (typeof text !== 'string') {
    return '';
  }
  return text.toLowerCase();
};

const patternMatches = (pattern, input) => {
  if (!(pattern instanceof RegExp)) {
    return false;
  }

  const safeFlags = pattern.flags.replace(/g/g, '');
  const safePattern = new RegExp(pattern.source, safeFlags);
  return safePattern.test(input);
};

const detectRuleBasedRisks = (text) => {
  const normalized = normalizeInput(text);

  if (!normalized) {
    return {
      risks: [],
      categories: [],
      totalScore: 0,
    };
  }

  const matchedRules = riskRules.filter((rule) =>
    rule.patterns.some((pattern) => patternMatches(pattern, normalized))
  );

  const risks = matchedRules.map((rule) => rule.riskText);
  const categories = [...new Set(matchedRules.map((rule) => rule.category))];
  const totalScore = matchedRules.reduce((sum, rule) => sum + rule.severity, 0);

  return {
    risks,
    categories,
    totalScore,
  };
};

const mergeRiskLists = (aiRisks = [], ruleRisks = []) => {
  const combined = [...aiRisks, ...ruleRisks]
    .filter((risk) => typeof risk === 'string')
    .map((risk) => risk.trim())
    .filter(Boolean);

  const uniqueByLowerCase = [];
  const seen = new Set();

  for (const risk of combined) {
    const key = risk.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueByLowerCase.push(risk);
    }
  }

  return uniqueByLowerCase;
};

module.exports = {
  detectRuleBasedRisks,
  mergeRiskLists,
  buildRiskAssessment,
};
