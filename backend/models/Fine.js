const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shopkeeper',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        default: 'Missed logging waste for 3 consecutive days'
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    razorpay_order_id: {
        type: String,
        default: null
    },
    razorpay_payment_id: {
        type: String,
        default: null
    },
    razorpay_signature: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Fine', fineSchema);
