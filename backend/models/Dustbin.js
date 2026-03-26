const mongoose = require('mongoose');

const dustbinSchema = new mongoose.Schema({
    dustbin_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    qr_code_link: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Dustbin', dustbinSchema);
