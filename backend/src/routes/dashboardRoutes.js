const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getDashboardActivity,
  getCriticalAssets,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/activity', getDashboardActivity);
router.get('/critical-assets', getCriticalAssets);

module.exports = router;
