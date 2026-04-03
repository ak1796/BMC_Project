const cron = require('node-cron');
const { performFineSync } = require('../controllers/fine.controller');

/**
 * Initializes the fine synchronization cron job.
 * Runs daily at midnight.
 */
const initFineCron = () => {
    // Schedule for 00:00 every day
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Starting daily fine synchronization...');
        try {
            const issuedFines = await performFineSync();
            console.log(`[Cron] Fine sync complete. Issued ${issuedFines.length} new fines.`);
        } catch (error) {
            console.error('[Cron] Error during fine synchronization:', error.message);
        }
    });

    console.log('[Cron] Fine synchronization job scheduled (at midnight daily).');
};

module.exports = { initFineCron };
