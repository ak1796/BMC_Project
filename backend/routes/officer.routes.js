const express = require('express');
const router = express.Router();
const { 
    loginOfficer,
    getOfficerMe,
    completeTask,
    createOfficer,
    getWardOfficers, 
    getPendingWardTasks, 
    assignTaskToOfficer, 
    resendAssignmentEmail,
    bulkCreateOfficers
} = require('../controllers/officer.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/role.middleware');

/**
 * @route   POST /api/officers/login
 * @desc    Officer Login
 */
router.post('/login', loginOfficer);

// All routes below require a valid token
router.use(protect);

/**
 * @route   GET /api/officers/me
 * @desc    Get current officer profile and assignment
 */
router.get('/me', getOfficerMe);

/**
 * @route   POST /api/officers/complete-task
 * @desc    Mark a task as complete
 */
router.post('/complete-task', completeTask);

// All routes below this are restricted to Admins
router.use(adminOnly);

/**
 * @route   POST /api/officers
 * @desc    Create a single officer manually
 */
router.post('/', createOfficer);

/**
 * @route   GET /api/officers/ward
 * @desc    Get all officers assigned to the admin's ward
 */
router.get('/ward', getWardOfficers);

/**
 * @route   GET /api/officers/tasks/pending
 * @desc    Get all pending alerts and bulky requests in the admin's ward
 */
router.get('/tasks/pending', getPendingWardTasks);

/**
 * @route   POST /api/officers/assign-task
 * @desc    Assign a task to an officer and notify them
 */
router.post('/assign-task', assignTaskToOfficer);

/**
 * @route   POST /api/officers/bulk
 * @desc    Bulk create officers (Excel/CSV import)
 */
router.post('/bulk', bulkCreateOfficers);

/**
 * @route   POST /api/officers/send-mail
 * @desc    Manually resend the assignment notification email
 */
router.post('/send-mail', resendAssignmentEmail);

module.exports = router;
