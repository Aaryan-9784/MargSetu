const express = require('express');
const router = express.Router();
const {
  getAllMaintenance,
  updateMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/').get(getAllMaintenance);

// Only ADMIN and MAINTENANCE_OFFICER can transition or resolve maintenance
router
  .route('/:id')
  .put(authorize('ADMIN', 'MAINTENANCE_OFFICER'), updateMaintenance);

module.exports = router;
