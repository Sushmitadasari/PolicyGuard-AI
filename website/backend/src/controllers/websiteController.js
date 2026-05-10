const { analyzeWebsite } = require('../services/websiteAnalysisService');
const { saveAnalysis } = require('../services/historyService');

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_error) {
    return false;
  }
};

const analyzeWebsiteUrl = async (req, res, next) => {
  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string' || !isValidHttpUrl(url)) {
      return res.status(400).json({ error: 'A valid website URL is required' });
    }

    const result = await analyzeWebsite(url);

    const userId = req.user?._id?.toString() || '';
    await saveAnalysis({
      userId,
      source: 'website',
      policyText: result.text,
      analysis: result.analysis,
      documentName: result.fileName,
      fileName: result.fileName,
      analysisType: 'WEBSITE',
      metadata: {
        url: result.finalUrl,
        title: result.title,
        statusCode: result.statusCode,
      },
    });

    return res.status(200).json(result.response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeWebsiteUrl,
};