const express = require('express');
const router = express.Router();
const { createWasteLog, getWasteLogs, getUnloggedShops, getDefaulters, exportLoggedWaste, exportUnloggedWaste, exportMyLogs, deleteWasteLog } = require('../controllers/waste.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.route('/')
    .post(protect, createWasteLog)
    .get(protect, getWasteLogs);

router.delete('/:id', protect, deleteWasteLog);

router.get('/export/my-logs', protect, exportMyLogs);
router.get('/unlogged', protect, adminOnly, getUnloggedShops);
router.get('/defaulters', protect, adminOnly, getDefaulters);
router.get('/export/logged', protect, adminOnly, exportLoggedWaste);
router.get('/export/unlogged', protect, adminOnly, exportUnloggedWaste);

module.exports = router;
