const express = require('express');
const { analyzeWebsiteUrl } = require('../controllers/websiteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzeWebsiteUrl);

module.exports = router;