const express = require('express');
const { pdfUploadFields } = require('../middleware/uploadMiddleware');
const pdfController = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /pdf/upload - multipart form with `pdf` or `file` field
router.post('/upload', protect, pdfUploadFields, pdfController.uploadAndAnalyze);

module.exports = router;
