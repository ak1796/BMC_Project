const express = require('express');
const router = express.Router();
const { 
    generateAlert, 
    getAlerts, 
    updateAlertStatus, 
    deleteAlert,
    scanAlert,
    createPublicAlert 
} = require('../controllers/alert.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.get('/scan', scanAlert);
router.post('/public-report', createPublicAlert);

router.route('/')
    .post(protect, generateAlert)
    .get(protect, getAlerts);

router.route('/:id')
    .put(protect, updateAlertStatus)
    .delete(protect, deleteAlert);

module.exports = router;
