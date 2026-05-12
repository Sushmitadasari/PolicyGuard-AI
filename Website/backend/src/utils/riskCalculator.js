const clampScore = (score) => {
  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score < 0) {
    return 0;
  }

  if (score > 10) {
    return 10;
  }

  return Math.round(score);
};

const getRiskLevelFromScore = (score) => {
  if (score >= 8) {
    return 'High';
  }

  if (score >= 4) {
    return 'Medium';
  }

  return 'Low';
};

const getScoreFloorFromRiskLevel = (riskLevel) => {
  if (riskLevel === 'High') {
    return 8;
  }

  if (riskLevel === 'Medium') {
    return 4;
  }

  if (riskLevel === 'Low') {
    return 1;
  }

  return 0;
};

const calculateRiskScore = ({
  ruleScore = 0,
  riskCount = 0,
  categoryCount = 0,
  aiRiskScore = 0,
  aiRiskLevel = '',
} = {}) => {
  const baseRuleScore = Number.isFinite(ruleScore) ? ruleScore : 0;
  const riskCountBonus = Math.min(Math.max(riskCount, 0), 3);
  const categoryBonus = Math.min(Math.max(categoryCount, 0), 2);

  const computedScore = clampScore(baseRuleScore + riskCountBonus + categoryBonus);
  const aiScore = clampScore(aiRiskScore);
  const aiRiskLevelFloor = getScoreFloorFromRiskLevel(aiRiskLevel);

  return clampScore(Math.max(computedScore, aiScore, aiRiskLevelFloor));
};

const buildRiskAssessment = ({
  ruleScore = 0,
  riskCount = 0,
  categoryCount = 0,
  aiRiskScore = 0,
  aiRiskLevel = '',
} = {}) => {
  const riskScore = calculateRiskScore({
    ruleScore,
    riskCount,
    categoryCount,
    aiRiskScore,
    aiRiskLevel,
  });

  return {
    riskScore,
    riskLevel: getRiskLevelFromScore(riskScore),
  };
};

module.exports = {
  calculateRiskScore,
  getRiskLevelFromScore,
  buildRiskAssessment,
};
