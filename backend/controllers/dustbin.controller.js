const Dustbin = require('../models/Dustbin');

const registerDustbin = async (req, res) => {
    try {
        const { dustbin_id, location, qr_code_link, admin_id } = req.body;

        const dustbinExists = await Dustbin.findOne({ dustbin_id });
        if (dustbinExists) {
            return res.status(400).json({ message: 'Dustbin already exists' });
        }

        const dustbinData = {
            dustbin_id,
            location,
            qr_code_link
        };

        if (admin_id && admin_id.trim() !== '') {
            dustbinData.admin_id = admin_id;
        }

        const dustbin = await Dustbin.create(dustbinData);

        res.status(201).json(dustbin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDustbinByQR = async (req, res) => {
    try {
        const { qr_code_link } = req.params;
        const dustbin = await Dustbin.findOne({ qr_code_link });

        if (dustbin) {
            res.json(dustbin);
        } else {
            res.status(404).json({ message: 'Dustbin not found for this QR' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getDustbinsByAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        const dustbins = await Dustbin.find({ admin_id: adminId });
        res.json(dustbins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllDustbins = async (req, res) => {
    try {
        const dustbins = await Dustbin.find({}).select('dustbin_id location admin_id');
        res.json(dustbins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerDustbin, getDustbinByQR, getDustbinsByAdmin, getAllDustbins };
