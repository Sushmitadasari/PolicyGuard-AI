const express = require('express');
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard-stats', protect, historyController.getDashboardStats);
router.get('/', protect, historyController.getHistoryController);
router.get('/:id', protect, historyController.getSingleAnalysisController);
router.delete('/:id', protect, historyController.deleteAnalysisController);

module.exports = router;