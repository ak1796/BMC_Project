const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Shopkeeper = require('../models/Shopkeeper');
const Admin = require('../models/Admin');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { username, shop_id, shop_name, shopkeeper_name, location, ward, marketArea, shopLocation, admin_id, dustbin_id, contact_number, password, role } = req.body;

        if (!username || !ward) {
            return res.status(400).json({ message: 'Username and Ward are required' });
        }

        // Check if username taken by shopkeeper
        const shopkeeperExists = await Shopkeeper.findOne({ username });
        if (shopkeeperExists) {
            return res.status(400).json({ message: 'Username already taken by another shop' });
        }

        // Check if username taken by admin
        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            return res.status(400).json({ message: 'Username reserved for administrative personnel' });
        }

        const { v4: uuidv4 } = require('uuid');
        const finalShopId = shop_id || `SHP-${uuidv4().substring(0,8)}-${uuidv4().substring(9,13)}`.toUpperCase();

        const idExists = await Shopkeeper.findOne({ shop_id: finalShopId });
        if (idExists) {
            return res.status(400).json({ message: 'Shop ID already exists. Please regenerate or re-attempt.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const shopkeeperData = {
            shop_id: finalShopId,
            username,
            shop_name,
            shopkeeper_name,
            location,
            ward,
            marketArea,
            shopLocation,
            contact_number,
            password: hashedPassword,
            dustbin_id,
            role: role || 'shopkeeper'
        };

        if (admin_id && admin_id.trim() !== '') {
            shopkeeperData.admin_id = admin_id;
        }

        const user = await Shopkeeper.create(shopkeeperData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                shop_id: user.shop_id,
                username: user.username,
                shop_name: user.shop_name,
                shopkeeper_name: user.shopkeeper_name,
                location: user.location,
                ward: user.ward,
                marketArea: user.marketArea,
                shopLocation: user.shopLocation,
                contact_number: user.contact_number,
                role: user.role,
                admin_id: user.admin_id,
                dustbin_id: user.dustbin_id,
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

        // Find by shop_id OR username
        const user = await Shopkeeper.findOne({
            $or: [
                { shop_id: shop_id },
                { username: shop_id }
            ]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                shop_id: user.shop_id,
                username: user.username,
                shop_name: user.shop_name,
                shopkeeper_name: user.shopkeeper_name,
                location: user.location,
                ward: user.ward,
                marketArea: user.marketArea,
                shopLocation: user.shopLocation,
                contact_number: user.contact_number,
                role: user.role,
                admin_id: user.admin_id,
                dustbin_id: user.dustbin_id,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid identifiers or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { username, admin_name, ward, office_location, contact_number, email, password } = req.body;
        
        if (!ward) {
            return res.status(400).json({ message: 'Ward assignment is required for administrators' });
        }

        const adminExists = await Admin.findOne({ username });
        if (adminExists) return res.status(400).json({ message: 'Admin exists' });

        const salt = await bcrypt.genSalt(10);
        const admin = await Admin.create({
            username,
            admin_name,
            ward,
            office_location,
            contact_number,
            email,
            password: await bcrypt.hash(password, salt)
        });
        res.status(201).json({ 
            _id: admin._id, 
            username: admin.username, 
            admin_name: admin.admin_name,
            ward: admin.ward,
            office_location: admin.office_location,
            contact_number: admin.contact_number,
            email: admin.email,
            role: admin.role, 
            token: generateToken(admin._id) 
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({ 
                _id: admin._id, 
                username: admin.username, 
                admin_name: admin.admin_name,
                ward: admin.ward,
                office_location: admin.office_location,
                contact_number: admin.contact_number,
                email: admin.email,
                role: admin.role, 
                token: generateToken(admin._id) 
            });
        } else { res.status(401).json({ message: 'Invalid credentials' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { registerUser, loginUser, registerAdmin, loginAdmin };
