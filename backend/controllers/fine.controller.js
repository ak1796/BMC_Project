const Fine = require('../models/Fine');
const Shopkeeper = require('../models/Shopkeeper');
const WasteLog = require('../models/WasteLog');

/**
 * Internal logic to sync fines for shops that haven't logged waste in 3 days.
 * @param {string|null} adminId - If provided, only syncs shops belonging to this admin.
 */
const performFineSync = async (adminId = null) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    // 1. Identify shop IDs that HAVE logged in the last 72h
    const recentLogs = await WasteLog.find({ timestamp: { $gte: threeDaysAgo } }).select('shop_id');
    const recentShopIds = recentLogs.map(log => log.shop_id.toString());

    // 2. Find shops that HAVEN'T logged
    let shopFilter = { _id: { $nin: recentShopIds } };
    if (adminId) {
        shopFilter.admin_id = adminId;
    }

    const shops = await Shopkeeper.find(shopFilter);

    // 3. Issue fines only if they don't have a pending "inactivity" fine already
    const issuedFines = [];
    for (const shop of shops) {
        // Special case: check if shop has NEVER logged anything but was created > 3 days ago
        // (Optional: current logic handles it because nin recentShopIds includes those with 0 logs)
        
        const existingFine = await Fine.findOne({
            shop_id: shop._id,
            status: 'Pending',
            reason: /Missed logging/i
        });

        if (!existingFine) {
            const newFine = await Fine.create({
                shop_id: shop._id,
                amount: 500,
                reason: 'Missed logging waste for 3 consecutive days'
            });
            issuedFines.push(newFine);
        }
    }
    return issuedFines;
};

const issueFine = async (req, res) => {
    try {
        const { shop_id, amount, reason } = req.body;
        
        const fine = await Fine.create({
            shop_id,
            amount: amount || 500,
            reason: reason || 'Manual administrative penalty'
        });

        res.status(201).json(fine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFines = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin') {
            filter.shop_id = req.user._id;
        } else if (req.query.shopId) {
            filter.shop_id = req.query.shopId;
        }

        const fines = await Fine.find(filter)
            .populate('shop_id', 'shop_name shop_id location')
            .sort({ issuedAt: -1 });
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const payFine = async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.id);
        if (fine) {
            fine.status = 'Paid';
            await fine.save();
            res.json(fine);
        } else {
            res.status(404).json({ message: 'Fine not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const syncFines = async (req, res) => {
    try {
        // Manual trigger from admin dashboard
        const results = await performFineSync(req.user._id);
        res.json({ 
            message: `Fine synchronization complete for your shops. ${results.length} new fines issued.`, 
            fines: results 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFineStats = async (req, res) => {
    try {
        const stats = await Fine.aggregate([
            {
                $group: {
                    _id: "$status",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const formattedStats = {
            Pending: { count: 0, amount: 0 },
            Paid: { count: 0, amount: 0 }
        };

        stats.forEach(s => {
            if (formattedStats[s._id]) {
                formattedStats[s._id] = { count: s.count, amount: s.totalAmount };
            }
        });

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { issueFine, getFines, payFine, syncFines, getFineStats, performFineSync };
