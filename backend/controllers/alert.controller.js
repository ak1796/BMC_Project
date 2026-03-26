const Alert = require('../models/Alert');
const { v4: uuidv4 } = require('uuid');

const generateAlert = async (req, res) => {
    try {
        const { dustbin_id, comments } = req.body;

        const alert = await Alert.create({
            alert_id: uuidv4(),
            dustbin_id,
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
        const alert = await Alert.findById(req.params.id);

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

module.exports = { generateAlert, getAlerts, updateAlertStatus };
