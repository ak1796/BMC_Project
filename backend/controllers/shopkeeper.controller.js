const Shopkeeper = require('../models/Shopkeeper');
const bcrypt = require('bcryptjs');

const getProfiles = async (req, res) => {
    try {
        const profiles = await Shopkeeper.find().select('-password');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await Shopkeeper.findById(req.user._id);

        if (user) {
            user.shop_name = req.body.shop_name || user.shop_name;
            user.location = req.body.location || user.location;
            
            if (req.body.shopkeeper_name !== undefined) user.shopkeeper_name = req.body.shopkeeper_name;
            if (req.body.contact_number !== undefined) user.contact_number = req.body.contact_number;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                shop_id: updatedUser.shop_id,
                username: updatedUser.username,
                shop_name: updatedUser.shop_name,
                shopkeeper_name: updatedUser.shopkeeper_name,
                location: updatedUser.location,
                contact_number: updatedUser.contact_number,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfiles, updateProfile };
