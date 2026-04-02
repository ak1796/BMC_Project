const mongoose = require('mongoose');

const shopkeeperSchema = new mongoose.Schema({
    shop_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    shop_name: {
        type: String,
        required: true,
        trim: true
    },
    shopkeeper_name: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    contact_number: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: 'shopkeeper'
    }
}, { timestamps: true });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);
