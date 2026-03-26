const express = require('express');
const router = express.Router();
const { issueFine, getFines, payFine } = require('../controllers/fine.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

router.route('/')
    .post(protect, adminOnly, issueFine)
    .get(protect, getFines); // Admin sees all, Shopkeeper sees own

router.put('/:id/pay', protect, payFine); 

module.exports = router;
