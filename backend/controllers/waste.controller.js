const WasteLog = require('../models/WasteLog');
const Shopkeeper = require('../models/Shopkeeper');
const { v4: uuidv4 } = require('uuid');

const createWasteLog = async (req, res) => {
    try {
        const { dustbin_id, waste_type, no_of_bags, bulky_request } = req.body;

        const bagsCount = no_of_bags || 1;
        let calculated_bag_size = 'Low';
        if (bagsCount >= 3 && bagsCount <= 5) calculated_bag_size = 'Med';
        else if (bagsCount > 5) calculated_bag_size = 'High';

        const log = await WasteLog.create({
            log_id: uuidv4(),
            shop_id: req.user._id,
            dustbin_id, 
            waste_type,
            bag_size: calculated_bag_size,
            no_of_bags: bagsCount,
            bulky_request: bulky_request || false
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWasteLogs = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin') {
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

        const logs = await WasteLog.find({ timestamp: { $gte: today } })
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

        const unloggedShops = await Shopkeeper.find({ _id: { $nin: loggedShopIds } }).select('-password');

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

        const unloggedShops = await Shopkeeper.find({ _id: { $nin: loggedShopIds } }).select('-password');
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
        const defaulterShops = await Shopkeeper.find({ _id: { $nin: recentShopIds } }).select('-password');
        res.json(defaulterShops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createWasteLog, getWasteLogs, getUnloggedShops, getDefaulters, exportLoggedWaste, exportUnloggedWaste };
