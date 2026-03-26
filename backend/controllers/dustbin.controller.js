const Dustbin = require('../models/Dustbin');

const registerDustbin = async (req, res) => {
    try {
        const { dustbin_id, location, qr_code_link } = req.body;

        const dustbinExists = await Dustbin.findOne({ dustbin_id });
        if (dustbinExists) {
            return res.status(400).json({ message: 'Dustbin already exists' });
        }

        const dustbin = await Dustbin.create({
            dustbin_id,
            location,
            qr_code_link
        });

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

module.exports = { registerDustbin, getDustbinByQR };
