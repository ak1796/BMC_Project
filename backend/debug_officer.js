const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Officer = require('./models/officer.model');
const Alert = require('./models/Alert');
const BulkyRequest = require('./models/BulkyRequest');

dotenv.config();

async function debugOfficer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const officer = await Officer.findOne({ officerName: /R\.KHAN/i });
        if (!officer) {
            console.log('Officer R.KHAN not found');
            process.exit(0);
        }

        console.log('Officer found:', {
            id: officer._id,
            name: officer.officerName,
            status: officer.availabilityStatus,
            currentAssignment: officer.currentAssignment,
            assignmentModel: officer.assignmentModel,
            busyUntil: officer.busyUntil
        });

        if (officer.currentAssignment) {
            let task;
            if (officer.assignmentModel === 'Alert') {
                task = await Alert.findById(officer.currentAssignment);
            } else if (officer.assignmentModel === 'BulkyRequest') {
                task = await BulkyRequest.findById(officer.currentAssignment);
            }
            console.log('Task found:', task);
        } else {
            console.log('No current assignment ID on officer.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debugOfficer();
