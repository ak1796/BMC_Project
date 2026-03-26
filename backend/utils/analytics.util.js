const WasteLog = require('../models/WasteLog');
const Alert = require('../models/Alert');

const getDailyWasteSummary = async () => {
    // Logic for aggregating daily waste logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await WasteLog.aggregate([
        { $match: { timestamp: { $gte: today } } },
        { $group: { _id: "$shop_id", totalLogs: { $sum: 1 } } }
    ]);
    return logs;
};

module.exports = { getDailyWasteSummary };
