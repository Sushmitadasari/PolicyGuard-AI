export const mockAnalysis = {
  website: "facebook.com",
  riskScore: 82,
  riskLevel: "HIGH",
  summary:
    "This website collects extensive behavioral, location, and advertising tracking data from users.",

  risks: [
    {
      title: "Third-party Data Sharing",
      severity: "High",
      description:
        "Your data may be shared with advertisers and analytics providers.",
    },
    {
      title: "Advertising Tracking",
      severity: "High",
      description:
        "Cross-platform tracking is enabled for personalized ads.",
    },
    {
      title: "Location Tracking",
      severity: "Medium",
      description:
        "Precise location information may be collected.",
    },
  ],

  recommendations: [
    "Disable personalized ads",
    "Review privacy settings",
    "Avoid sharing sensitive information",
  ],
}