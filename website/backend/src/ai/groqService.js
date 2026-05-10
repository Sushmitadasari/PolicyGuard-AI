const axios = require("axios");

const askGroq = async (prompt) => {
  try {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);

    throw new Error("Groq AI request failed");
  }
};

module.exports = {
  askGroq,
};
