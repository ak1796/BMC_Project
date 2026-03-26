const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Shopkeeper = require('../models/Shopkeeper');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('ak1796', salt);

        // Seed Admin
        const adminExists = await Admin.findOne({ username: '2024alinakhan_db_user' });
        if (!adminExists) {
            await Admin.create({
                username: '2024alinakhan_db_user',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user seeded: 2024alinakhan_db_user / ak1796');
        } else {
            console.log('Admin user already exists.');
        }

        // Seed Shopkeeper
        const shopkeeperExists = await Shopkeeper.findOne({ shop_id: 'SHOP001' });
        if (!shopkeeperExists) {
            await Shopkeeper.create({
                shop_id: 'SHOP001',
                shop_name: 'Initial Shop',
                location: 'Default Location',
                password: hashedPassword,
                role: 'shopkeeper'
            });
            console.log('Shopkeeper seeded: SHOP001 / ak1796');
        } else {
            console.log('Shopkeeper already exists.');
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seed();
