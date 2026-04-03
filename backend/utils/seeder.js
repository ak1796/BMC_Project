const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Shopkeeper = require('../models/Shopkeeper');
const Dustbin = require('../models/Dustbin');
const Alert = require('../models/Alert');
const WasteLog = require('../models/WasteLog');
const Fine = require('../models/Fine');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear all collections
        await Admin.deleteMany({});
        await Shopkeeper.deleteMany({});
        await Dustbin.deleteMany({});
        await Alert.deleteMany({});
        await WasteLog.deleteMany({});
        await Fine.deleteMany({});
        console.log('All collections cleared.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('ak1796', salt);

        // Seed Admin
        const adminExists = await Admin.findOne({ username: '2024alinakhan_db_user' });
        let admin;
        if (!adminExists) {
            admin = await Admin.create({
                username: '2024alinakhan_db_user',
                password: hashedPassword,
                admin_name: 'Alina Khan',
                office_location: 'BMC Head Office',
                role: 'admin'
            });
            console.log('Admin user seeded: 2024alinakhan_db_user / ak1796');
        } else {
            admin = adminExists;
            console.log('Admin user already exists.');
        }

        // Seed Shopkeeper
        const shopkeeperExists = await Shopkeeper.findOne({ shop_id: 'SHOP001' });
        if (!shopkeeperExists) {
            await Shopkeeper.create({
                username: 'shop001user',
                shop_id: 'SHOP001',
                shop_name: 'Initial Shop',
                location: 'Default Location',
                admin_id: admin._id,
                password: hashedPassword,
                role: 'shopkeeper'
            });
            console.log('Shopkeeper seeded: SHOP001 / ak1796 / shop001user');
        } else {
            console.log('Shopkeeper already exists.');
        }

        // Seed Dustbin
        const dustbinExists = await Dustbin.findOne({ dustbin_id: 'SMW-DB-000001' });
        if (!dustbinExists) {
            await Dustbin.create({
                dustbin_id: 'SMW-DB-000001',
                location: 'Main Block Gate',
                admin_id: admin._id,
                qr_code_link: `${process.env.BASE_URL || 'http://localhost:5000'}/api/alerts/scan?dustbin=SMW-DB-000001`
            });
            console.log('Dustbin seeded: SMW-DB-000001 at Main Block Gate');
        } else {
            console.log('Dustbin already exists.');
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seed();
