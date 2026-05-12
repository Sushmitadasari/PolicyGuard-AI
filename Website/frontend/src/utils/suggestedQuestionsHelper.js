/**
 * Generates AI-powered suggested questions based on analysis context
 * Questions adapt to the specific risks, clauses, and confidence scores
 */

export const generateSuggestedQuestions = (analysis = null) => {
  const defaultQuestions = [
    "What are the main risks?",
    "Summarize the key concerns",
    "Is this safe?",
    "Explain the top risk",
    "What should I do?",
  ];

  if (!analysis) {
    return defaultQuestions;
  }

  const questions = new Set();

  // Based on risk score
  if (analysis.riskScore >= 7) {
    questions.add("Why is this risky?");
    questions.add("What are the danger zones?");
    questions.add("How can I mitigate these risks?");
  } else if (analysis.riskScore >= 4) {
    questions.add("What concerns exist?");
    questions.add("Are there any serious issues?");
  } else {
    questions.add("Is this safe?");
    questions.add("Any red flags?");
  }

  // Based on clauses
  if (analysis.clauses && analysis.clauses.length > 0) {
    const clause = analysis.clauses[0];
    if (clause.type) {
      questions.add(`Explain the ${clause.type} clause`);
      questions.add(`What does "${clause.type}" mean?`);
    }
    questions.add("Which clause is most concerning?");
    questions.add("What do these clauses mean?");
  }

  // Based on detected risks
  if (analysis.risks && analysis.risks.length > 0) {
    const risk = analysis.risks[0];
    questions.add(`Explain "${risk}"`);
    questions.add(`What should I know about ${risk}?`);
  }

  // Based on confidence
  if (analysis.confidence < 60) {
    questions.add("How confident is this analysis?");
    questions.add("Why is confidence low?");
  }

  // Based on source
  if (analysis.source === "pdf") {
    questions.add("What makes this document risky?");
    questions.add("Summarize this policy");
  } else if (analysis.source === "web" || analysis.source === "website") {
    questions.add("What tracking exists?");
    questions.add("Does this site share my data?");
    questions.add("What privacy concerns exist?");
  }

  // Privacy & legal questions
  questions.add("Is this GDPR compliant?");
  questions.add("What should I watch out for?");
  questions.add("Summarize in simple terms");

  // Convert to array and take first 5-6 unique questions
  return Array.from(questions).slice(0, 6);
};

export const getPolicyCategory = (analysis) => {
  if (!analysis) return "Document";

  if (analysis.source === "pdf") return "PDF";
  if (analysis.source === "web" || analysis.source === "website") return "Website";
  if (analysis.source === "extension") return "Extension Analysis";

  return "Document";
};

export const getRiskEmoji = (riskScore) => {
  if (riskScore >= 8) return "🔴";
  if (riskScore >= 6) return "🟠";
  if (riskScore >= 4) return "🟡";
  return "🟢";
};
