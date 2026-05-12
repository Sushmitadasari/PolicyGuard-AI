const express = require('express');
const { analyzeV1, getAnalyzeJobStatus } = require('../controllers/v1AnalyzeController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', optionalAuth, analyzeV1);
router.get('/analyze/jobs/:jobId', protect, getAnalyzeJobStatus);

module.exports = router;