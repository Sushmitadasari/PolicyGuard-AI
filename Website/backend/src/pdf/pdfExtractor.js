const pdfParseModule = require('pdf-parse');

const cleanExtractedText = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractPdfText = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid PDF buffer');
  }

  let parsed = null;

  if (typeof pdfParseModule === 'function') {
    parsed = await pdfParseModule(buffer);
  } else if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    parsed = await parser.getText();
  } else if (pdfParseModule && typeof pdfParseModule.default === 'function') {
    parsed = await pdfParseModule.default(buffer);
  } else {
    throw new Error('PDF parser is unavailable');
  }

  const text = cleanExtractedText(parsed?.text || parsed?.content || '');

  return {
    text,
    pageCount: Number.isFinite(parsed?.numpages) ? parsed.numpages : 0,
    info: parsed?.info || {},
  };
};

module.exports = {
  extractPdfText,
  cleanExtractedText,
};
