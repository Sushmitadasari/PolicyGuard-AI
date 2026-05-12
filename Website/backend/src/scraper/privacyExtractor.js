const cheerio = require('cheerio');
const { cleanText } = require('./htmlCleaner');

const extractReadableText = (html, baseUrl = '') => {
  if (typeof html !== 'string' || html.trim() === '') {
    return { text: '', title: '', sourceUrl: baseUrl };
  }

  const $ = cheerio.load(html);

  $('script, style, noscript, svg, iframe, footer, header, nav, form, aside').remove();

  const title = cleanText($('title').first().text());
  const mainSelectors = ['main', 'article', '[role="main"]', '.privacy', '.policy', '.terms', '#content'];

  let text = '';
  for (const selector of mainSelectors) {
    const candidate = cleanText($(selector).text());
    if (candidate.length > text.length) {
      text = candidate;
    }
  }

  if (!text) {
    text = cleanText($('body').text());
  }

  return {
    text,
    title,
    sourceUrl: baseUrl,
  };
};

module.exports = {
  extractReadableText,
};
