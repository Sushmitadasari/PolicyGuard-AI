const stripWhitespace = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanText = (text) => stripWhitespace(text)
  .replace(/(?:cookie policy|privacy policy|terms of service|terms and conditions)/gi, (match) => match.trim())
  .trim();

module.exports = {
  stripWhitespace,
  cleanText,
};
