const Alert = require('../models/Alert');
const Dustbin = require('../models/Dustbin');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const generateAlert = async (req, res) => {
    try {
        const { dustbin_id, comments } = req.body;

        // Resolve dustbin string ID to ObjectId (normalize: strip hyphens, case-insensitive)
        let dustbinObjectId = null;
        if (dustbin_id) {
            const normalized = dustbin_id.trim().replace(/-/g, '');
            const dustbin = await Dustbin.findOne({ dustbin_id: { $regex: new RegExp(`^${normalized}$`, 'i') } });
            if (dustbin) {
                dustbinObjectId = dustbin._id;
            } else {
                return res.status(404).json({ message: `Dustbin '${dustbin_id}' not found. Try: BIN001` });
            }
        }

        const alert = await Alert.create({
            alert_id: uuidv4(),
            dustbin_id: dustbinObjectId,
            shop_id: req.user._id,
            comments,
            status: 'Generated'
        });

        // Socket.io emit to notify admin dashboard
        if (req.io) {
            req.io.emit('new_alert', alert);
        }

        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().populate('dustbin_id').populate('shop_id', 'shop_name location');
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
            const updatedAlert = await alert.save();
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
