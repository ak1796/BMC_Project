const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.route('/profile').put(protect, adminOnly, updateProfile);

module.exports = router;
