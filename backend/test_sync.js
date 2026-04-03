const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { performFineSync } = require('./controllers/fine.controller');
const Shopkeeper = require('./models/Shopkeeper');
const WasteLog = require('./models/WasteLog');
const Fine = require('./models/Fine');

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database. Cleaning up old test data...');

        // 1. Cleanup previous test defaulters to keep it clean
        const testUsername = 'test_defaulter_sync';
        await Shopkeeper.deleteOne({ username: testUsername });
        
        // 2. Create a test shopkeeper with hashed password
        const adminId = '69cfaeebbc7bf07d77fcc9f4'; 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const shop = await Shopkeeper.create({
            shop_id: `TEST-${Math.floor(Math.random() * 1000)}`,
            username: testUsername,
            shop_name: 'Sync Test Shop (Inactivity)',
            shopkeeper_name: 'Automated Test',
            location: 'Terminal 1',
            admin_id: adminId,
            password: hashedPassword,
            role: 'shopkeeper'
        });

        console.log(`Created test shop: ${shop.shop_name}`);

        // 3. Create an OLD log (5 days ago)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        await WasteLog.create({
            log_id: `TLOG-${Math.random().toString(36).substr(2, 9)}`,
            shop_id: shop._id,
            waste_type: 'Dry',
            bag_size: 'Med',
            no_of_bags: 1,
            timestamp: fiveDaysAgo,
            admin_id: adminId
        });

        console.log(`Step 1: Added log from ${fiveDaysAgo.toDateString()}. Shop is now a defaulter (>3 days).`);

        // 4. Run the SYNC logic
        console.log('Step 2: Triggering Fine Synchronization...');
        const issuedFines = await performFineSync();

        console.log(`Step 3: Sync result -> ${issuedFines.length} fines issued.`);
        
        if (issuedFines.length > 0) {
            console.log('--- SUCCESS ---');
            console.log(`Fine issued for: ${shop.shop_name}`);
            console.log(`Reason: ${issuedFines[0].reason}`);
            console.log(`Amount: Rs. ${issuedFines[0].amount}`);
        } else {
            console.log('--- FAILED ---');
            console.log('No fines were issued. Check if the shop already had a pending fine or if the date logic is correct.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error running test sync:', err);
        process.exit(1);
    }
};

runTest();
