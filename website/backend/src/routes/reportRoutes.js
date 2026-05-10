const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id/download', protect, reportController.downloadReport);

module.exports = router;
