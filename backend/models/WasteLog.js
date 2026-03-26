const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
    log_id: {
        type: String,
        required: true,
        unique: true
    },
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shopkeeper',
        required: true
    },
    dustbin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dustbin',
        required: false
    },
    waste_type: {
        type: String,
        enum: ['Dry', 'Wet', 'Electronics'],
        required: true
    },
    bag_size: {
        type: String,
        enum: ['Low', 'Med', 'High'],
        required: true
    },
    no_of_bags: {
        type: Number,
        default: 1
    },
    bulky_request: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('WasteLog', wasteLogSchema);
