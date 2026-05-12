const { askGroq } = require("./groqService");
const { askGemini } = require("./geminiService");
const { askOpenAI } = require("./openaiService");

const askAI = async (prompt) => {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  switch (provider) {
    case "groq":
      return await askGroq(prompt);

    case "gemini":
      return await askGemini(prompt);

    case "openai":
      return await askOpenAI(prompt);

    default:
      throw new Error("Invalid AI provider");
  }
};

module.exports = {
  askAI,
};
