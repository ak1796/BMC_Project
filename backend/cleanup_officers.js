const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Officer = require('./models/officer.model');
const Alert = require('./models/Alert');
const BulkyRequest = require('./models/BulkyRequest');

dotenv.config();

async function cleanupOfficers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const busyOfficers = await Officer.find({ availabilityStatus: 'Busy' });
        console.log(`Found ${busyOfficers.length} busy officers.`);

        for (const officer of busyOfficers) {
            let task = null;
            if (officer.currentAssignment) {
                if (officer.assignmentModel === 'Alert') {
                    task = await Alert.findById(officer.currentAssignment);
                } else if (officer.assignmentModel === 'BulkyRequest') {
                    task = await BulkyRequest.findById(officer.currentAssignment);
                }
            }

            if (!task) {
                console.log(`Resetting officer ${officer.officerName} (${officer.employeeId}) because task ${officer.currentAssignment} is missing.`);
                officer.availabilityStatus = 'Available';
                officer.currentAssignment = null;
                officer.assignmentModel = null;
                await officer.save();
            } else {
                console.log(`Officer ${officer.officerName} is correctly busy with task ${task._id}.`);
            }
        }

        console.log('Cleanup complete.');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

cleanupOfficers();
