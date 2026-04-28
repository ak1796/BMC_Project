const mongoose = require('mongoose');

const bulkyRequestSchema = new mongoose.Schema({
    request_id: {
        type: String,
        required: true,
        unique: true
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
    waste_type: {
        type: String,
        required: true
    },
    no_of_bags: {
        type: Number,
        default: 1
    },
    comments: {
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
    },
    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer'
    },
    assignedAt: {
        type: Date
    },
    dispatchStatus: {
        type: String,
        default: 'Generated'
    },
    estimatedCompletionTime: {
        type: Number
    },
    dispatchNote: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('BulkyRequest', bulkyRequestSchema);
