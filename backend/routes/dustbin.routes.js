const express = require('express');
const router = express.Router();
const { registerDustbin, getDustbinByQR } = require('../controllers/dustbin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.post('/register', protect, adminOnly, registerDustbin);
router.get('/qr/:qr_code_link', protect, getDustbinByQR);

module.exports = router;
