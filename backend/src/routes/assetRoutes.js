const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const {
  getAssetInspections,
  createInspection,
} = require('../controllers/inspectionController');
const {
  getAssetMaintenance,
  createMaintenance,
} = require('../controllers/maintenanceController');
const { getAssetLifecycle } = require('../controllers/lifecycleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All asset routes require authentication
router.use(protect);

router
  .route('/')
  .get(getAssets)
  .post(authorize('ADMIN'), createAsset);

router
  .route('/:id')
  .get(getAssetById)
  .put(authorize('ADMIN'), updateAsset)
  .delete(authorize('ADMIN'), deleteAsset);

// Nested asset inspections
router
  .route('/:id/inspections')
  .get(getAssetInspections)
  .post(authorize('ADMIN', 'FIELD_INSPECTOR'), createInspection);

// Nested asset maintenance
router
  .route('/:id/maintenance')
  .get(getAssetMaintenance)
  .post(
    authorize('ADMIN', 'FIELD_INSPECTOR', 'MAINTENANCE_OFFICER'),
    createMaintenance
  );

// Nested asset lifecycle
router.route('/:id/lifecycle').get(getAssetLifecycle);

module.exports = router;
