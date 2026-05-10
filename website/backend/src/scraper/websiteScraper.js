const axios = require('axios');

const fetchWebsiteHtml = async (url) => {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('A valid URL is required');
  }

  const response = await axios.get(url.trim(), {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ai-legal-assistant/1.0)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    maxRedirects: 5,
  });

  return {
    html: typeof response.data === 'string' ? response.data : '',
    finalUrl: response.request?.res?.responseUrl || url.trim(),
    statusCode: response.status,
  };
};

module.exports = {
  fetchWebsiteHtml,
};
