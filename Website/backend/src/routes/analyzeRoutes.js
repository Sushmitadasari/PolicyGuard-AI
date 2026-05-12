const express = require('express');
const { analyzePolicy } = require('../controllers/analyzeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzePolicy);

module.exports = router;
