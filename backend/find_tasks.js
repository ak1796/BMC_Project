const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Officer = require('./models/officer.model');
const Alert = require('./models/Alert');
const BulkyRequest = require('./models/BulkyRequest');

dotenv.config();

async function findTasksForOfficer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const officer = await Officer.findOne({ officerName: /R\.KHAN/i });
        if (!officer) {
            console.log('Officer R.KHAN not found');
            process.exit(0);
        }

        console.log('Searching for tasks assigned to:', officer._id);

        const alerts = await Alert.find({ assignedOfficer: officer._id });
        const bulky = await BulkyRequest.find({ assignedOfficer: officer._id });

        console.log('Alerts assigned:', alerts.map(a => ({ id: a._id, status: a.status })));
        console.log('Bulky Requests assigned:', bulky.map(b => ({ id: b._id, status: b.status })));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

findTasksForOfficer();
