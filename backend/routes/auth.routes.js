const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerAdmin, loginAdmin } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

module.exports = router;
