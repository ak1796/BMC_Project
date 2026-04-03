const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        const user = await Admin.findById(req.user._id);

        if (user) {
            if (req.body.admin_name !== undefined) user.admin_name = req.body.admin_name;
            if (req.body.office_location !== undefined) user.office_location = req.body.office_location;
            if (req.body.contact_number !== undefined) user.contact_number = req.body.contact_number;
            if (req.body.email !== undefined) user.email = req.body.email;
            
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                admin_name: updatedUser.admin_name,
                office_location: updatedUser.office_location,
                contact_number: updatedUser.contact_number,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateProfile, getAdmins };
