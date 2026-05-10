const riskRules = [
  {
    id: 'data-sharing-third-party',
    category: 'data-sharing',
    severity: 3,
    riskText: 'Third-party data sharing',
    patterns: [
      /third[-\s]?party/gi,
      /share(?:d|s|)?\s+(?:your\s+)?(?:personal\s+)?data/gi,
      /affiliates?\s+and\s+partners?/gi,
      /marketing\s+partners?/gi,
    ],
  },
  {
    id: 'auto-renewal-billing',
    category: 'auto-renewal',
    severity: 3,
    riskText: 'Auto-renewal billing',
    patterns: [
      /auto[-\s]?renew(?:al|s|ed|)?/gi,
      /renews?\s+automatically/gi,
      /subscription\s+renews?/gi,
      /unless\s+cancel(?:led|ed|)/gi,
    ],
  },
  {
    id: 'tracking-profiling',
    category: 'tracking',
    severity: 2,
    riskText: 'User tracking and profiling',
    patterns: [
      /cookies?/gi,
      /track(?:ing|ed|s)?\s+(?:your\s+)?(?:activity|behavior)/gi,
      /usage\s+data/gi,
      /profil(?:e|ing)/gi,
      /analytics/gi,
    ],
  },
  {
    id: 'legal-waiver-limitation',
    category: 'legal-waiver',
    severity: 2,
    riskText: 'Legal waiver or liability limitation',
    patterns: [
      /waive(?:r|s|d)?\s+(?:your\s+)?rights?/gi,
      /class\s+action\s+waiver/gi,
      /binding\s+arbitration/gi,
      /limitation\s+of\s+liability/gi,
      /not\s+liable\s+for/gi,
    ],
  },
];

module.exports = {
  riskRules,
};
