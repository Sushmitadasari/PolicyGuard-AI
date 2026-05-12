const test = require('node:test');
const assert = require('node:assert/strict');

const loadFresh = (modulePath) => {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
};

const snapshotEnv = () => ({
  AI_PROVIDER: process.env.AI_PROVIDER,
});

const restoreEnv = (snapshot) => {
  if (snapshot.AI_PROVIDER === undefined) {
    delete process.env.AI_PROVIDER;
  } else {
    process.env.AI_PROVIDER = snapshot.AI_PROVIDER;
  }
};

test('aiProvider routes to Groq when AI_PROVIDER=groq', async () => {
  const env = snapshotEnv();
  const groqModulePath = '../src/ai/groqService';
  const groqModule = require(groqModulePath);
  const originalGroq = groqModule.askGroq;

  process.env.AI_PROVIDER = 'groq';
  groqModule.askGroq = async (prompt) => `groq:${prompt}`;

  try {
    const { askAI } = loadFresh('../src/ai/aiProvider');
    const result = await askAI('hello');
    assert.equal(result, 'groq:hello');
  } finally {
    groqModule.askGroq = originalGroq;
    restoreEnv(env);
  }
});

test('aiProvider routes to Gemini when AI_PROVIDER=gemini', async () => {
  const env = snapshotEnv();
  const geminiModule = require('../src/ai/geminiService');
  const originalGemini = geminiModule.askGemini;

  process.env.AI_PROVIDER = 'gemini';
  geminiModule.askGemini = async (prompt) => `gemini:${prompt}`;

  try {
    const { askAI } = loadFresh('../src/ai/aiProvider');
    const result = await askAI('hello');
    assert.equal(result, 'gemini:hello');
  } finally {
    geminiModule.askGemini = originalGemini;
    restoreEnv(env);
  }
});

test('aiProvider routes to OpenAI when AI_PROVIDER=openai', async () => {
  const env = snapshotEnv();
  const openaiModule = require('../src/ai/openaiService');
  const originalOpenAI = openaiModule.askOpenAI;

  process.env.AI_PROVIDER = 'openai';
  openaiModule.askOpenAI = async (prompt) => `openai:${prompt}`;

  try {
    const { askAI } = loadFresh('../src/ai/aiProvider');
    const result = await askAI('hello');
    assert.equal(result, 'openai:hello');
  } finally {
    openaiModule.askOpenAI = originalOpenAI;
    restoreEnv(env);
  }
});

test('aiProvider throws for unsupported provider', async () => {
  const env = snapshotEnv();
  process.env.AI_PROVIDER = 'unsupported';

  try {
    const { askAI } = loadFresh('../src/ai/aiProvider');
    await assert.rejects(() => askAI('hello'), /Invalid AI provider/);
  } finally {
    restoreEnv(env);
  }
});
