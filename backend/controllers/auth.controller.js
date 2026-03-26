const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Shopkeeper = require('../models/Shopkeeper');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { shop_id, shop_name, location, password, role } = req.body;

        const userExists = await Shopkeeper.findOne({ shop_id });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await Shopkeeper.create({
            shop_id,
            shop_name,
            location,
            password: hashedPassword,
            role: role || 'shopkeeper'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                shop_id: user.shop_id,
                shop_name: user.shop_name,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { shop_id, password } = req.body;

        const user = await Shopkeeper.findOne({ shop_id });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                shop_id: user.shop_id,
                shop_name: user.shop_name,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid shop_id or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Admin = require('../models/Admin');

const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const adminExists = await Admin.findOne({ username });
        if (adminExists) return res.status(400).json({ message: 'Admin exists' });

        const salt = await bcrypt.genSalt(10);
        const admin = await Admin.create({
            username,
            password: await bcrypt.hash(password, salt)
        });
        res.status(201).json({ _id: admin._id, username: admin.username, role: admin.role, token: generateToken(admin._id) });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({ _id: admin._id, username: admin.username, role: admin.role, token: generateToken(admin._id) });
        } else { res.status(401).json({ message: 'Invalid credentials' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { registerUser, loginUser, registerAdmin, loginAdmin };
