const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    alert_id: {
        type: String,
        required: true,
        unique: true
    },
    dustbin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dustbin',
        required: true
    },
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shopkeeper',
        required: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    comments: {
        type: String
    },
    resolution_message: {
        type: String
    },
    status: {
        type: String,
        enum: ['Generated', 'Dispatched', 'Resolved'],
        default: 'Generated'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
