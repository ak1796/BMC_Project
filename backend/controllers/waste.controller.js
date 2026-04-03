const Shopkeeper = require('../models/Shopkeeper');
const Dustbin = require('../models/Dustbin');
const WasteLog = require('../models/WasteLog');
const Alert = require('../models/Alert');
const { v4: uuidv4 } = require('uuid');

const createWasteLog = async (req, res) => {
    try {
        const { dustbin_id, waste_type, no_of_bags, bulky_request } = req.body;

        const bagsCount = no_of_bags || 1;
        let calculated_bag_size = 'Low';
        if (bagsCount >= 3 && bagsCount <= 5) calculated_bag_size = 'Med';
        else if (bagsCount > 5) calculated_bag_size = 'High';

        // Resolve dustbin string ID to ObjectId (case-insensitive, supports hyphens)
        let dustbinObjectId = null;
        let associatedAdminId = null;

        if (dustbin_id && dustbin_id.trim() !== '') {
            let parsedDustbinId = dustbin_id.trim();

            if (parsedDustbinId.startsWith('{') && parsedDustbinId.endsWith('}')) {
                try {
                    const parsed = JSON.parse(parsedDustbinId);
                    if (parsed.dustbin_id) {
                        parsedDustbinId = parsed.dustbin_id;
                    }
                } catch (e) {}
            }

            const normalizedSearch = parsedDustbinId.replace(/-/g, '').toLowerCase();

            // Use $expr to strip hyphens and lowercase the DB's dustbin_id for a bulletproof comparison
            const dustbin = await Dustbin.findOne({
                $expr: {
                    $eq: [
                        { $toLower: { $replaceAll: { input: "$dustbin_id", find: "-", replacement: "" } } },
                        normalizedSearch
                    ]
                }
            });

            if (dustbin) {
                dustbinObjectId = dustbin._id;
                associatedAdminId = dustbin.admin_id;
            } else {
                // Fetch real available dustbins for the user's admin (fallback to all if admin_id missing)
                const adminFilter = req.user.admin_id ? { admin_id: req.user.admin_id } : {};
                const available = await Dustbin.find(adminFilter).limit(5).select('dustbin_id');
                const availableStr = available.map(b => b.dustbin_id).join(', ') || 'None registered';
                return res.status(404).json({ message: `Dustbin '${parsedDustbinId}' not found. Available: ${availableStr}` });
            }
        }

        if (bulky_request) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const existingBulkyRequest = await WasteLog.findOne({
                shop_id: req.user._id,
                bulky_request: true,
                timestamp: { $gte: today }
            });

            if (existingBulkyRequest) {
                return res.status(400).json({ message: 'Limit exceeded: Only 1 bulky waste request per day is allowed.' });
            }
        }

        const log = await WasteLog.create({
            log_id: uuidv4(),
            shop_id: req.user._id,
            dustbin_id: dustbinObjectId, 
            admin_id: associatedAdminId,
            waste_type,
            bag_size: calculated_bag_size,
            no_of_bags: bagsCount,
            bulky_request: bulky_request || false
        });

        if (bulky_request) {
            const bulkyAlert = await Alert.create({
                alert_id: uuidv4(),
                dustbin_id: dustbinObjectId,
                admin_id: associatedAdminId,
                shop_id: req.user._id,
                comments: `BULKY WASTE REQUEST: ${bagsCount} bags of ${waste_type} waste.`,
                status: 'Generated'
            });

            if (req.io) {
                // Populate required fields for the UI before emitting
                await bulkyAlert.populate('shop_id', 'shop_name location');
                await bulkyAlert.populate('dustbin_id');
                req.io.emit('new_alert', bulkyAlert);
            }
        }

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWasteLogs = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'admin') {
            filter.admin_id = req.user._id;
        } else if (req.user.role !== 'admin') {
            filter.shop_id = req.user._id;
        }

        const logs = await WasteLog.find(filter)
            .populate('dustbin_id')
            .populate('shop_id', 'shop_id shop_name location');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const ExcelJS = require('exceljs');

const exportLoggedWaste = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let query = { timestamp: { $gte: today } };
        if (req.user.role === 'admin') {
            query.admin_id = req.user._id;
        }

        const logs = await WasteLog.find(query)
            .populate('shop_id', 'shop_id shop_name location');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Daily Waste Logs');

        sheet.columns = [
            { header: 'Shop ID', key: 'shop_id', width: 15 },
            { header: 'Shop Name', key: 'shop_name', width: 25 },
            { header: 'Location', key: 'location', width: 20 },
            { header: 'Waste Type', key: 'waste_type', width: 15 },
            { header: 'No of Bags', key: 'no_of_bags', width: 10 },
            { header: 'Size', key: 'bag_size', width: 10 },
            { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];

        logs.forEach(log => {
            sheet.addRow({
                shop_id: log.shop_id.shop_id,
                shop_name: log.shop_id.shop_name,
                location: log.shop_id.location,
                waste_type: log.waste_type,
                no_of_bags: log.no_of_bags,
                bag_size: log.bag_size,
                timestamp: log.timestamp.toLocaleString()
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Daily_Waste_Logs_${today.toDateString()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportUnloggedWaste = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logsToday = await WasteLog.find({ timestamp: { $gte: today } }).select('shop_id');
        const loggedShopIds = logsToday.map(log => log.shop_id);

        let query = { _id: { $nin: loggedShopIds } };
        if (req.user.role === 'admin') {
            query.admin_id = req.user._id;
        }

        const unloggedShops = await Shopkeeper.find(query).select('-password');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Unlogged Shops');

        sheet.columns = [
            { header: 'Shop ID', key: 'shop_id', width: 15 },
            { header: 'Shop Name', key: 'shop_name', width: 25 },
            { header: 'Location', key: 'location', width: 20 }
        ];

        unloggedShops.forEach(shop => {
            sheet.addRow({
                shop_id: shop.shop_id,
                shop_name: shop.shop_name,
                location: shop.location
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Unlogged_Shops_${today.toDateString()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUnloggedShops = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logsToday = await WasteLog.find({ timestamp: { $gte: today } }).select('shop_id');
        const loggedShopIds = logsToday.map(log => log.shop_id);

        let query = { _id: { $nin: loggedShopIds } };
        if (req.user.role === 'admin') {
            query.admin_id = req.user._id;
        }

        const unloggedShops = await Shopkeeper.find(query).select('-password');
        res.json(unloggedShops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDefaulters = async (req, res) => {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        threeDaysAgo.setHours(0, 0, 0, 0);

        // Find logs from the last 3 days
        const recentLogs = await WasteLog.find({ timestamp: { $gte: threeDaysAgo } }).select('shop_id');
        const recentShopIds = recentLogs.map(log => log.shop_id);

        // Find shops who are NOT in the recent logs
        let query = { _id: { $nin: recentShopIds } };
        if (req.user.role === 'admin') {
            query.admin_id = req.user._id;
        }

        const defaulterShops = await Shopkeeper.find(query).select('-password');
        res.json(defaulterShops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportMyLogs = async (req, res) => {
    try {
        const logs = await WasteLog.find({ shop_id: req.user._id })
            .populate('shop_id', 'shop_id shop_name location');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('My Waste Logs');

        sheet.columns = [
            { header: 'Shop ID', key: 'shop_id', width: 15 },
            { header: 'Shop Name', key: 'shop_name', width: 25 },
            { header: 'Location', key: 'location', width: 20 },
            { header: 'Waste Type', key: 'waste_type', width: 15 },
            { header: 'No of Bags', key: 'no_of_bags', width: 10 },
            { header: 'Size', key: 'bag_size', width: 10 },
            { header: 'Timestamp', key: 'timestamp', width: 25 }
        ];

        logs.forEach(log => {
            sheet.addRow({
                shop_id: log.shop_id.shop_id,
                shop_name: log.shop_id.shop_name,
                location: log.shop_id.location,
                waste_type: log.waste_type,
                no_of_bags: log.no_of_bags,
                bag_size: log.bag_size,
                timestamp: log.timestamp.toLocaleString()
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=My_Waste_Logs.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteWasteLog = async (req, res) => {
    try {
        const log = await WasteLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }
        if (log.shop_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await log.deleteOne();
        res.json({ message: 'Log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createWasteLog, getWasteLogs, getUnloggedShops, getDefaulters, exportLoggedWaste, exportUnloggedWaste, exportMyLogs, deleteWasteLog };
