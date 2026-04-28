const Officer = require('../models/officer.model');
const Alert = require('../models/Alert');
const BulkyRequest = require('../models/BulkyRequest');
const Shopkeeper = require('../models/Shopkeeper');
const crypto = require('crypto');

/**
 * @desc    Helper to generate a unique BMC Officer ID
 */
const generateOfficerId = () => {
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `BMC-OFF-${randomPart}`;
};

const jwt = require('jsonwebtoken');

/**
 * @desc    Officer Login
 * @route   POST /api/officers/login
 * @access  Public
 */
const loginOfficer = async (req, res) => {
    try {
        const { employeeId, password } = req.body;

        if (!employeeId || !password) {
            return res.status(400).json({ message: 'Employee ID and password are required' });
        }

        const officer = await Officer.findOne({ employeeId });
        if (!officer) {
            return res.status(401).json({ message: 'Invalid Employee ID' });
        }

        // Simple password check (user requested simple setup)
        if (password !== officer.password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: officer._id, role: 'officer', employeeId: officer.employeeId },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            _id: officer._id,
            officerName: officer.officerName,
            employeeId: officer.employeeId,
            role: 'officer',
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Create a single officer manually
 * @route   POST /api/officers
 * @access  Private (Admin)
 */
const createOfficer = async (req, res) => {
    try {
        let { officerName, employeeId, email, phoneNumber, ward } = req.body;

        if (!officerName || !email || !phoneNumber) {
            return res.status(400).json({ 
                message: 'Mandatory fields missing', 
                required: ['officerName', 'email', 'phoneNumber'],
                received: { officerName, email, phoneNumber }
            });
        }

        // Auto-generate ID if not provided
        if (!employeeId || employeeId.trim() === '') {
            employeeId = generateOfficerId();
        }

        const existing = await Officer.findOne({ employeeId });
        if (existing) {
            return res.status(400).json({ message: `Conflict: Employee ID ${employeeId} is already registered.` });
        }

        const officer = await Officer.create({
            officerName,
            employeeId,
            email,
            phoneNumber,
            ward: ward || (req.user && req.user.ward) || 'General',
            availabilityStatus: 'Available',
            password: 'bmc123' // Explicitly set default password
        });

        console.log(`Success: Registered officer ${officer.officerName} (${officer.employeeId})`);
        res.status(201).json(officer);
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};

/**
 * @desc    Fetch officers in the same ward as the logged-in admin
 * @route   GET /api/officers/ward
 * @access  Private (Admin)
 */
const getWardOfficers = async (req, res) => {
    try {
        // Return all officers for manual management as requested
        const officers = await Officer.find({});
        res.json(officers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Fetch pending tasks (Alerts & Bulky Requests) in the admin's ward
 * @route   GET /api/officers/tasks/pending
 * @access  Private (Admin)
 */
const getPendingWardTasks = async (req, res) => {
    try {
        const ward = req.user.ward;
        let query = { status: 'Generated' };

        if (ward) {
            // If admin has a ward, filter tasks by shops in that ward
            const shopkeepers = await Shopkeeper.find({ ward }).select('_id');
            const shopIds = shopkeepers.map(s => s._id);
            query.shop_id = { $in: shopIds };
        }

        const alerts = await Alert.find(query).populate('shop_id', 'shop_name location marketArea ward');
        const bulkyRequests = await BulkyRequest.find(query).populate('shop_id', 'shop_name location marketArea ward');

        // Step 3: Combine and format for unified UI handling
        const tasks = [
            ...alerts.map(a => ({ ...a.toObject(), taskType: 'Alert' })),
            ...bulkyRequests.map(b => ({ ...b.toObject(), taskType: 'BulkyRequest' }))
        ];

        // Sort by oldest first to prioritize aging tickets
        tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Assign a specific ticket to an officer and update their status
 * @route   POST /api/officers/assign
 * @access  Private (Admin)
 */
const assignTaskToOfficer = async (req, res) => {
    try {
        const { taskId, taskType, officerId, dispatchNote } = req.body;

        if (!taskId || !taskType || !officerId) {
            return res.status(400).json({ message: 'Task ID, Task Type, and Officer ID are required' });
        }

        // 1. Verify Officer Availability
        const officer = await Officer.findById(officerId);
        if (!officer) {
            return res.status(404).json({ message: 'Officer record not found' });
        }

        if (officer.availabilityStatus !== 'Available') {
            return res.status(400).json({ message: `Assignment failed: Officer is currently ${officer.availabilityStatus}` });
        }

        // 2. SLA Logic Helper
        const getTaskDuration = (type, comments) => {
            if (type === 'BulkyRequest') return 6;

            const comment = (comments || '').toLowerCase();
            if (comment.includes('full')) return 2;
            if (comment.includes('damaged')) return 4;
            if (comment.includes('overflow')) return 3;

            return 2;
        };

        let task;
        if (taskType === 'Alert') {
            task = await Alert.findById(taskId);
        } else if (taskType === 'BulkyRequest') {
            task = await BulkyRequest.findById(taskId);
        }

        if (!task) {
            return res.status(404).json({ message: 'Task not found in registry' });
        }

        const estimatedHours = getTaskDuration(taskType, task.comments);
        const busyUntil = new Date();
        busyUntil.setHours(busyUntil.getHours() + estimatedHours);

        // 3. Reassignment Logic: If already assigned, reset the previous officer
        if (task.assignedOfficer) {
            console.log(`[Officer System] Task ${task._id} was assigned to ${task.assignedOfficer}. Resetting previous officer.`);
            await resetOfficerStatus(task.assignedOfficer);
        }

        // 4. Update the Task
        task.assignedOfficer = officerId;
        task.assignedAt = new Date();
        task.dispatchStatus = 'Assigned';
        task.status = 'Dispatched';
        task.estimatedCompletionTime = estimatedHours;
        task.dispatchNote = dispatchNote || `Unit assigned. Expected resolution in ${estimatedHours}h.`;

        await task.save();

        // 4. Update Officer Profile
        officer.availabilityStatus = 'Busy';
        officer.busyUntil = busyUntil;
        officer.currentAssignment = taskId;
        officer.assignmentModel = taskType;
        officer.assignedTasksCount += 1;
        await officer.save();

        // 5. Send Notification Email (Asynchronous)
        try {
            const fullTask = await task.populate([
                { path: 'shop_id' },
                { path: 'dustbin_id' }
            ]);

            const { sendOfficerAssignmentEmail } = require('../utils/mail');
            await sendOfficerAssignmentEmail({
                officer,
                task: { ...fullTask.toObject(), taskType },
                shopkeeper: fullTask.shop_id,
                dustbin: fullTask.dustbin_id
            });
        } catch (mailError) {
            console.error('Mail notification failed:', mailError.message);
        }

        res.status(200).json({
            message: 'Task successfully dispatched and officer notified via email',
            assignment: {
                officer: officer.officerName,
                eta: `${estimatedHours} hours`,
                task: task.alert_id || task.request_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Mark a task as complete
 * @route   POST /api/officers/complete-task
 * @access  Private (Officer)
 */
const completeTask = async (req, res) => {
    try {
        const { taskId, taskType } = req.body;
        const officerId = req.user.id;

        let task;
        if (taskType === 'Alert') {
            task = await Alert.findById(taskId);
        } else if (taskType === 'BulkyRequest') {
            task = await BulkyRequest.findById(taskId);
        }

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify this task is assigned to this officer
        if (task.assignedOfficer.toString() !== officerId) {
            return res.status(403).json({ message: 'You are not authorized to complete this task' });
        }

        // Update Task
        task.status = 'Resolved';
        task.resolvedAt = new Date();
        await task.save();

        // Update Officer
        const officer = await Officer.findById(officerId);
        officer.availabilityStatus = 'Available';
        officer.currentAssignment = null;
        officer.assignmentModel = null;
        await officer.save();

        res.json({ message: 'Task marked as completed and your status is now Available' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Helper to reset an officer's availability status when a task is resolved/deleted
 */
const resetOfficerStatus = async (officerId) => {
    if (!officerId) return;
    try {
        await Officer.findByIdAndUpdate(officerId, {
            availabilityStatus: 'Available',
            currentAssignment: null,
            assignmentModel: null
        });
        console.log(`[Officer System] Reset officer ${officerId} to Available.`);
    } catch (err) {
        console.error('Failed to reset officer status:', err.message);
    }
};

/**
 * @desc    Manually resend the assignment email for an existing task
 * @route   POST /api/officers/send-mail
 * @access  Private (Admin)
 */
const resendAssignmentEmail = async (req, res) => {
    try {
        const { taskId, taskType } = req.body;

        if (!taskId || !taskType) {
            return res.status(400).json({ message: 'Task ID and Type are required' });
        }

        let task;
        if (taskType === 'Alert') {
            task = await Alert.findById(taskId).populate(['shop_id', 'dustbin_id', 'assignedOfficer']);
        } else {
            task = await BulkyRequest.findById(taskId).populate(['shop_id', 'assignedOfficer']);
        }

        if (!task || !task.assignedOfficer) {
            return res.status(404).json({ message: 'Task or assigned officer not found' });
        }

        const { sendOfficerAssignmentEmail } = require('../utils/mail');
        await sendOfficerAssignmentEmail({
            officer: task.assignedOfficer,
            task: { ...task.toObject(), taskType },
            shopkeeper: task.shop_id,
            dustbin: task.dustbin_id
        });

        res.json({ message: 'Assignment email resent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Bulk create officers from an array (used for Excel/CSV imports)
 * @route   POST /api/officers/bulk
 * @access  Private (Admin)
 */
const bulkCreateOfficers = async (req, res) => {
    try {
        const { officers } = req.body;
        const adminWard = req.user.ward; // Optional fallback

        if (!Array.isArray(officers) || officers.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty officers list' });
        }

        // Process each officer
        const processedOfficers = officers.map(off => ({
            ...off,
            // Auto-generate ID if missing in the file
            employeeId: off.employeeId || generateOfficerId(),
            // Use ward from file if present, otherwise fallback to admin's ward
            ward: off.ward || adminWard || '',
            availabilityStatus: 'Available',
            assignedTasksCount: 0
        }));

        // Check for duplicates before inserting
        const employeeIds = processedOfficers.map(o => o.employeeId);
        const existingOfficers = await Officer.find({ employeeId: { $in: employeeIds } });
        const existingIds = existingOfficers.map(o => o.employeeId);

        const newOfficers = processedOfficers.filter(o => !existingIds.includes(o.employeeId));

        if (newOfficers.length === 0) {
            return res.status(400).json({ message: 'All officers in the file already exist in the system.' });
        }

        const created = await Officer.insertMany(newOfficers);
        
        res.status(201).json({
            message: `Successfully imported ${created.length} officers.`,
            skipped: existingIds.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get current officer profile and assignment
 * @route   GET /api/officers/me
 * @access  Private (Officer)
 */
const getOfficerMe = async (req, res) => {
    try {
        const officer = await Officer.findById(req.user.id);
        if (!officer) return res.status(404).json({ message: 'Officer not found' });

        let currentTask = null;
        if (officer.currentAssignment) {
            if (officer.assignmentModel === 'Alert') {
                currentTask = await Alert.findById(officer.currentAssignment).populate('shop_id').populate('dustbin_id');
            } else {
                currentTask = await BulkyRequest.findById(officer.currentAssignment).populate('shop_id');
            }

            // SELF-HEALING: If assignment ID exists but task is missing, reset officer status
            if (!currentTask && officer.availabilityStatus === 'Busy') {
                console.log(`[Self-Healing] Missing task ${officer.currentAssignment} for officer ${officer.officerName}. Resetting to Available.`);
                officer.availabilityStatus = 'Available';
                officer.currentAssignment = null;
                officer.assignmentModel = null;
                await officer.save();
            }
        }

        res.json({
            officer,
            currentTask: currentTask ? { ...currentTask.toObject(), taskType: officer.assignmentModel } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    loginOfficer,
    getOfficerMe,
    createOfficer,
    getWardOfficers,
    getPendingWardTasks,
    assignTaskToOfficer,
    resendAssignmentEmail,
    bulkCreateOfficers,
    completeTask,
    resetOfficerStatus
};
