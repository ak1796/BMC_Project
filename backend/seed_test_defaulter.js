const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const Shopkeeper = require('./models/Shopkeeper');
const Fine = require('./models/Fine');
const WasteLog = require('./models/WasteLog');
const { v4: uuidv4 } = require('uuid');

const seedTestDefaulter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        const adminId = '69cfaeebbc7bf07d77fcc9f4'; // Existing Admin ID
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const shopId = `TS-${randomId}`;

        // Hash the password for the shopkeeper
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create a shopkeeper that hasn't logged waste in 3 days
        const testShop = await Shopkeeper.create({
            shop_id: shopId,
            username: `tester_${randomId}`,
            shop_name: `Test Defaulter Shop ${randomId}`,
            shopkeeper_name: 'Defaulter Dave',
            location: 'Testing Zone 0',
            admin_id: adminId,
            dustbin_id: 'DB-TEST-001',
            contact_number: '9876543210',
            password: hashedPassword,
            role: 'shopkeeper'
        });

        console.log(`Created test shop: ${testShop.shop_name} (${testShop.shop_id})`);

        // 2. Add a log from 5 days ago to make it a "real" defaulter
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        await WasteLog.create({
            log_id: `LOG-${uuidv4().substring(0,8)}`,
            shop_id: testShop._id,
            waste_type: 'Dry',
            bag_size: 'Med',
            no_of_bags: 2,
            timestamp: fiveDaysAgo,
            admin_id: adminId
        });
        console.log('Added an old log (5 days ago) for history.');

        console.log('--- TEST DATA GENERATED ---');
        console.log(`\nTEST SCENARIO READY:`);
        console.log(`Shop Name: ${testShop.shop_name}`);
        console.log(`Username: tester_${randomId}`);
        console.log(`Shop ID: ${testShop.shop_id}`);
        console.log(`Password: password123`);
        console.log(`Last Log Date: ${fiveDaysAgo.toDateString()}`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding test data:', err);
        process.exit(1);
    }
};

seedTestDefaulter();
