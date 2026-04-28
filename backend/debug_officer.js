const mongoose = require('mongoose');
require('dotenv').config();
const Officer = require('./models/officer.model');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const res = await Officer.create({
            officerName: 'Debug Unit',
            employeeId: 'DEBUG-' + Date.now(),
            email: 'debug@bmc.gov.in',
            phoneNumber: '0000000000',
            ward: 'K-East'
        });
        
        console.log('Successfully created officer:', res);
        process.exit(0);
    } catch (err) {
        console.error('Error creating officer:', err.message);
        process.exit(1);
    }
}

test();
