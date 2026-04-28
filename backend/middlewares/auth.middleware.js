const jwt = require('jsonwebtoken');
const Shopkeeper = require('../models/Shopkeeper');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Try Shopkeeper, then Admin, then Officer
            req.user = await Shopkeeper.findById(decoded.id).select('-password');
            if (!req.user) {
                const Admin = require('../models/Admin');
                req.user = await Admin.findById(decoded.id).select('-password');
            }
            if (!req.user) {
                const Officer = require('../models/officer.model');
                req.user = await Officer.findById(decoded.id).select('-password');
            }
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
