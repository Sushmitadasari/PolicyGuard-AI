const axios = require('axios');

/**
 * Browser-like headers to bypass anti-bot protection
 * Mimics Chrome on Windows to appear as legitimate user traffic
 */
const getBrowserHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
});

/**
 * Create axios instance with enhanced configuration
 * for reliable website content fetching
 */
const createAxiosInstance = () => {
  return axios.create({
    timeout: 15000,
    maxRedirects: 10,
    responseType: 'arraybuffer', // Handle binary responses
    validateStatus: (status) => status >= 200 && status < 300, // Accept 2xx only
  });
};

/**
 * Attempt to fetch website HTML with progressive fallback strategies
 * Retries with different configurations if initial attempts fail
 */
const fetchWebsiteHtmlWithRetry = async (url, attempt = 1) => {
  const maxAttempts = 3;

  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('A valid URL is required');
  }

  const normalizedUrl = url.trim();
  const axiosInstance = createAxiosInstance();

  try {
    // Attempt 1: Standard browser headers with gzip encoding
    if (attempt === 1) {
      const response = await axiosInstance.get(normalizedUrl, {
        headers: getBrowserHeaders(),
      });

      return {
        html: typeof response.data === 'string'
          ? response.data
          : Buffer.from(response.data).toString('utf-8'),
        finalUrl: response.request?.path || normalizedUrl,
        statusCode: response.status,
      };
    }

    // Attempt 2: Reduced headers to avoid triggering strict anti-bot
    if (attempt === 2) {
      const response = await axiosInstance.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,*/*;q=0.9',
        },
        timeout: 10000, // Shorter timeout
      });

      return {
        html: typeof response.data === 'string'
          ? response.data
          : Buffer.from(response.data).toString('utf-8'),
        finalUrl: response.request?.path || normalizedUrl,
        statusCode: response.status,
      };
    }

    // Attempt 3: Minimal headers as last resort
    if (attempt === 3) {
      const response = await axiosInstance.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 8000,
      });

      return {
        html: typeof response.data === 'string'
          ? response.data
          : Buffer.from(response.data).toString('utf-8'),
        finalUrl: response.request?.path || normalizedUrl,
        statusCode: response.status,
      };
    }
  } catch (error) {
    // Log error details for debugging
    const errorInfo = {
      url: normalizedUrl,
      attempt,
      status: error.response?.status,
      message: error.message,
    };

    console.error('Website fetch attempt failed:', errorInfo);

    // Retry with next strategy if not max attempts
    if (attempt < maxAttempts) {
      // Add exponential backoff
      const delayMs = Math.min(1000 * Math.pow(1.5, attempt - 1), 3000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchWebsiteHtmlWithRetry(normalizedUrl, attempt + 1);
    }

    // All attempts exhausted
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error(
        `Access denied (${error.response.status}). Website may have anti-bot protection. Please try again later.`
      );
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Request timeout. Website took too long to respond.');
    }

    if (error.code === 'ENOTFOUND') {
      throw new Error('Website not found. Please verify the URL.');
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused. Website may be down.');
    }

    throw new Error(`Failed to fetch website after ${maxAttempts} attempts: ${error.message}`);
  }
};

const fetchWebsiteHtml = async (url) => {
  return fetchWebsiteHtmlWithRetry(url, 1);
};

module.exports = {
  fetchWebsiteHtml,
};
