const express = require('express');
const router = express.Router();
const { getProfiles, updateProfile } = require('../controllers/shopkeeper.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.route('/').get(protect, adminOnly, getProfiles);
router.route('/profile').put(protect, updateProfile);

module.exports = router;
