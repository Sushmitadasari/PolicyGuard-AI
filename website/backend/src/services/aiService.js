const { askAI: providerAskAI } = require('../ai/aiProvider');

const askAI = async (prompt) => {
  try {
    // Orchestration / preprocessing could go here in future
    const resp = await providerAskAI(prompt);
    // Post-processing / normalization could go here
    return resp;
  } catch (err) {
    throw new Error(`AI Service Error: ${err.message}`);
  }
};

module.exports = {
  askAI,
};
