const { chunkText, mergeChunkResults } = require('../services/chunkingService');

const chunkPdfText = (text) => chunkText(text);

module.exports = {
  chunkPdfText,
  mergeChunkResults,
};
