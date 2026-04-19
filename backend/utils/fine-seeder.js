const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Fine = require('../models/Fine');
const Shopkeeper = require('../models/Shopkeeper');

dotenv.config();

const seedFines = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding fines...');

        // Verify there is at least one shopkeeper
        const shops = await Shopkeeper.find({});
        if (shops.length === 0) {
            console.error('No Shopkeepers found! Please run the main seeder first: node utils/seeder.js');
            process.exit(1);
        }

        // Delete existing fines to start fresh
        await Fine.deleteMany({});
        console.log('Cleared existing fines...');

        const fakeFines = [];
        const statuses = ['Pending', 'Paid'];
        const reasons = [
            'Missed logging waste for 3 consecutive days',
            'Improper waste segregation (Wet/Dry mixed)',
            'Waste dumped outside designated bin area',
            'Failure to report bulky waste correctly'
        ];

        // Generate 30 random fines spread over the last 90 days
        for (let i = 0; i < 30; i++) {
            const randomShop = shops[Math.floor(Math.random() * shops.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
            const randomAmount = Math.floor(Math.random() * 5 + 1) * 100; // 100, 200, 300, 400, 500

            // Random date within the last 90 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));

            const fineObj = {
                shop_id: randomShop._id,
                amount: randomAmount,
                reason: randomReason,
                status: randomStatus,
                issuedAt: date
            };

            // If "Paid", simulate a Razorpay webhook/backend fulfillment
            if (randomStatus === 'Paid') {
                fineObj.razorpay_order_id = `order_test_${Math.floor(Math.random() * 1000000)}`;
                fineObj.razorpay_payment_id = `pay_test_${Math.floor(Math.random() * 1000000)}`;
                fineObj.razorpay_signature = `sig_${Math.floor(Math.random() * 1000000)}`;
            }

            fakeFines.push(fineObj);
        }

        await Fine.insertMany(fakeFines);
        console.log(`Successfully seeded ${fakeFines.length} Fines (Pending & Paid) for testing the Admin Dashboard!`);
        
        console.log(`
==================================================
        RAZORPAY TEST CARD DETAILS
==================================================
To test the "Pay Now" button in the frontend modal,
use the following Test Card credentials provided by Razorpay:

Card Number: 4111 1111 1111 1111
Expiry (MM/YY): Any future date (e.g., 12/32)
CVV: Any 3 digits (e.g., 123)
OTP: Any numbers (e.g., 123456)
==================================================
        `);

        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seedFines();
