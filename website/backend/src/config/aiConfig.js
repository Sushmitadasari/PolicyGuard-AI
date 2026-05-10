// AI Provider Configuration - Abstraction Layer
// This allows easy switching between providers (Groq, Gemini, OpenAI, Claude)

const aiProvider = process.env.AI_PROVIDER || 'groq';

let modelConfig;

if (aiProvider === 'groq') {
  modelConfig = {
    provider: 'groq',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    baseUrl: 'https://api.groq.com/openai/v1'
  };
} else if (aiProvider === 'gemini') {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  modelConfig = {
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY,
    client: genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  };
} else {
  throw new Error(`Unsupported AI provider: ${aiProvider}`);
}

module.exports = modelConfig;