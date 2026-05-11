const analyzePolicy = async (content) => {

  return {
    riskScore: 87,

    riskLevel: "HIGH",

    summary:
      "This policy contains third-party tracking and advertising clauses.",

    risks: [
      {
        title: "Third-party Sharing",
        severity: "HIGH",
        description:
          "User data may be shared with advertisers.",
      },

      {
        title: "Tracking",
        severity: "HIGH",
        description:
          "Behavioral tracking is enabled.",
      },
    ],

    recommendations: [
      "Disable tracking permissions",
      "Review privacy settings",
    ],
  };

};

module.exports = {
  analyzePolicy,
};