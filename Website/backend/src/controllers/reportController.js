const historyService = require('../services/historyService');
const reportService = require('../services/reportService');

const downloadReport = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || '';
    const id = req.params.id;
    const analysis = await historyService.getAnalysisById(id, userId);
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

    let pdfBuffer;
    try {
      pdfBuffer = await reportService.generatePdfReport(analysis);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError.message);
      throw pdfError;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="policyguard-report-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  downloadReport,
};
