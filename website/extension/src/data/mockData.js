export const mockAnalysis = {
  website: "facebook.com",

  riskScore: 82,

  riskLevel: "HIGH",

  summary:
    "This website collects extensive behavioral, advertising, and location tracking data from users.",

  risks: [
    {
      title: "Third-party Data Sharing",
      severity: "High",
      description:
        "Your personal information may be shared with advertisers and analytics companies.",
    },

    {
      title: "Advertising Tracking",
      severity: "High",
      description:
        "Cross-platform tracking is enabled for personalized advertising.",
    },

    {
      title: "Location Tracking",
      severity: "Medium",
      description:
        "This website may collect precise location information.",
    },
  ],

  recommendations: [
    "Disable personalized advertisements",
    "Limit location permissions",
    "Review privacy settings regularly",
  ],
};