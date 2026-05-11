const express = require("express");

const router = express.Router();

const {
  analyzePolicy,
} = require("../services/aiService");

router.post("/", async (req, res) => {

  try {

    const { url, content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: "No content provided",
      });
    }

    const aiResult =
      await analyzePolicy(content);

    res.json({
      website: url,
      ...aiResult,
    });

  } catch (error) {

    console.error(
  "AI ANALYSIS ERROR:",
  error.response?.data || error.message || error
);

  }

});

module.exports = router;