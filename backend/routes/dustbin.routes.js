const express = require('express');
const router = express.Router();
const { registerDustbin, getDustbinByQR, getDustbinsByAdmin, getAllDustbins } = require('../controllers/dustbin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.post('/register', protect, adminOnly, registerDustbin);
router.get('/all', getAllDustbins);
router.get('/qr/:qr_code_link', protect, getDustbinByQR);
router.get('/admin/:adminId', getDustbinsByAdmin);

module.exports = router;
