const express = require('express');
const router = express.Router();
const { generateAlert, getAlerts, updateAlertStatus, deleteAlert } = require('../controllers/alert.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.route('/')
    .post(protect, generateAlert)
    .get(protect, adminOnly, getAlerts);

router.route('/:id')
    .put(protect, adminOnly, updateAlertStatus)
    .delete(protect, adminOnly, deleteAlert);

module.exports = router;
