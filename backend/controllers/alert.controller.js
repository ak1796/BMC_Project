const Alert = require('../models/Alert');
const Dustbin = require('../models/Dustbin');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const generateAlert = async (req, res) => {
    try {
        const { dustbin_id, comments } = req.body;

        // Resolve dustbin string ID to ObjectId (normalize: strip hyphens, case-insensitive)
        let dustbinObjectId = null;
        let associatedAdminId = null;

        if (dustbin_id) {
            let parsedDustbinId = dustbin_id.trim();
            // In case the user pasted the raw QR JSON string
            if (parsedDustbinId.startsWith('{') && parsedDustbinId.endsWith('}')) {
                try {
                    const parsed = JSON.parse(parsedDustbinId);
                    if (parsed.dustbin_id) {
                        parsedDustbinId = parsed.dustbin_id;
                    }
                } catch (e) {
                    // Ignore, use as is
                }
            }

            const normalizedSearch = parsedDustbinId.replace(/-/g, '').toLowerCase();
            
            // Use $expr to strip hyphens and lowercase the DB's dustbin_id for a bulletproof comparison
            const dustbin = await Dustbin.findOne({
                $expr: {
                    $eq: [
                        { $toLower: { $replaceAll: { input: "$dustbin_id", find: "-", replacement: "" } } },
                        normalizedSearch
                    ]
                }
            });
            
            if (dustbin) {
                dustbinObjectId = dustbin._id;
                associatedAdminId = dustbin.admin_id;
            } else {
                return res.status(404).json({ message: `Dustbin '${parsedDustbinId}' not found. Try format: SMW-DB-XXXXXX` });
            }
        }

        const alert = await Alert.create({
            alert_id: uuidv4(),
            dustbin_id: dustbinObjectId,
            admin_id: associatedAdminId,
            shop_id: req.user._id,
            comments,
            status: 'Generated'
        });

        // Socket.io emit to notify admin dashboard
        if (req.io) {
            // If we have an admin_id, we could emit to a specific room 'admin_<id>'
            // For now, we'll keep it simple but the data itself is now routed.
            req.io.emit('new_alert', alert);
        }

        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAlerts = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            query.admin_id = req.user._id;
        } else {
            query.shop_id = req.user._id;
        }

        const alerts = await Alert.find(query).populate('dustbin_id').populate('shop_id', 'shop_name location');
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAlertStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const id = req.params.id;

        // Try finding by internal mongodb ID or our string alert_id
        let alert;
        if (mongoose.Types.ObjectId.isValid(id)) {
            alert = await Alert.findById(id);
        }
        
        if (!alert) {
            alert = await Alert.findOne({ alert_id: id });
        }

        if (alert) {
            alert.status = status;
            if (req.body.resolution_message) {
                alert.resolution_message = req.body.resolution_message;
            }
            const updatedAlert = await alert.save();
            
            if (status === 'Resolved' && req.io) {
                req.io.emit('alert_resolved', updatedAlert);
            }

            res.json(updatedAlert);
        } else {
            res.status(404).json({ message: 'Alert not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAlert = async (req, res) => {
    try {
        const id = req.params.id;
        let alert;
        if (mongoose.Types.ObjectId.isValid(id)) {
            alert = await Alert.findById(id);
        }
        
        if (!alert) {
            alert = await Alert.findOne({ alert_id: id });
        }

        if (alert) {
            if (req.user.role !== 'admin' && alert.shop_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            await alert.deleteOne();
            res.json({ message: 'Alert removed' });
        } else {
            res.status(404).json({ message: 'Alert not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateAlert, getAlerts, updateAlertStatus, deleteAlert };
