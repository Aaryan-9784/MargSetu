const express = require('express');
const router = express.Router();
const { getAllLifecycleEvents } = require('../controllers/lifecycleController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getAllLifecycleEvents);

module.exports = router;
