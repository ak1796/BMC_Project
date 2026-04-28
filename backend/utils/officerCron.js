const cron = require('node-cron');
const Officer = require('../models/officer.model');

/**
 * Initializes the officer availability reset job.
 * Checks for officers whose busy period has expired and resets them to 'Available'.
 * Runs every hour on the hour.
 */
const initOfficerCron = () => {
    // Schedule: Minute 0 of every hour
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Checking officer availability for auto-reset...');
        try {
            const currentTime = new Date();
            
            // Find officers who are 'Busy' but their 'busyUntil' time has passed
            const result = await Officer.updateMany(
                {
                    availabilityStatus: 'Busy',
                    busyUntil: { $lte: currentTime }
                },
                {
                    $set: {
                        availabilityStatus: 'Available',
                        currentAssignment: null,
                        assignmentModel: null
                    }
                }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`[Cron] Auto-reset complete. ${result.modifiedCount} officers are now Available.`);
            }
        } catch (error) {
            console.error('[Cron] Error during officer availability reset:', error.message);
        }
    });

    console.log('[Cron] Officer availability reset job scheduled (hourly).');
};

module.exports = { initOfficerCron };
