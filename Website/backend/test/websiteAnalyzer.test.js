const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const loadWebsiteAnalysisService = (askAIStub) => {
  const aiServicePath = require.resolve('../src/services/aiService');
  const websiteAnalysisPath = require.resolve('../src/services/websiteAnalysisService');

  delete require.cache[aiServicePath];
  delete require.cache[websiteAnalysisPath];

  require.cache[aiServicePath] = {
    id: aiServicePath,
    filename: aiServicePath,
    loaded: true,
    exports: {
      askAI: askAIStub,
    },
  };

  return require('../src/services/websiteAnalysisService');
};

test('websiteScraper and extractor handle a local policy page', async () => {
  const html = `
    <html>
      <head><title>Privacy Policy</title></head>
      <body>
        <main>
          <h1>Privacy Policy</h1>
          <p>We use cookies and share your data with third-party advertisers.</p>
        </main>
      </body>
    </html>
  `;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const { fetchWebsiteHtml } = require('../src/scraper/websiteScraper');
    const { extractReadableText } = require('../src/scraper/privacyExtractor');

    const fetched = await fetchWebsiteHtml(`http://127.0.0.1:${port}/privacy`);
    const extracted = extractReadableText(fetched.html, fetched.finalUrl);

    assert.equal(fetched.statusCode, 200);
    assert.match(extracted.title, /Privacy Policy/i);
    assert.match(extracted.text, /third-party advertisers/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('analyzeWebsite returns frontend-ready results for a local policy page', async () => {
  const html = `
    <html>
      <head><title>Privacy Policy</title></head>
      <body>
        <main>
          <h1>Privacy Policy</h1>
          <p>We use cookies and share your data with third-party advertisers.</p>
          <p>We retain information indefinitely.</p>
        </main>
      </body>
    </html>
  `;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const { analyzeWebsite } = loadWebsiteAnalysisService(async () => JSON.stringify({
      summary: 'AI summary for the site',
      risks: ['Cookies tracking'],
      riskLevel: 'Medium',
      simplified: ['Simplified explanation'],
    }));

    const result = await analyzeWebsite(`http://127.0.0.1:${port}/privacy`);

    assert.equal(result.response.success, true);
    assert.equal(result.response.analysis.riskLevel, 'High');
    assert.ok(result.response.analysis.riskScore >= 8);
    assert.ok(result.response.analysis.confidence > 0);
    assert.ok(result.response.analysis.clauses.length > 0);
    assert.match(result.response.metadata.url, /127\.0\.0\.1/);
    assert.equal(result.fileName, 'Privacy Policy');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
