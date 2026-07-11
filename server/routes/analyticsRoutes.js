const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getAnalytics, getMonthlySummary, getAiInsights } = require('../controllers/analyticsController');

router.get('/analytics', protect, getAnalytics);
router.get('/monthly-summary', protect, getMonthlySummary);
router.get('/ai-insights', protect, getAiInsights);

module.exports = router;
