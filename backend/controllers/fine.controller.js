const Fine = require('../models/Fine');

const issueFine = async (req, res) => {
    try {
        const { shop_id, amount, reason } = req.body;
        
        const fine = await Fine.create({
            shop_id,
            amount: amount || 500, // Default 500 currency if not specified
            reason: reason || 'Missed logging waste for 3 consecutive days'
        });

        res.status(201).json(fine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFines = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin') {
            filter.shop_id = req.user._id;
        }

        const fines = await Fine.find(filter).populate('shop_id', 'shop_name shop_id location');
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const payFine = async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.id);
        if (fine) {
            fine.status = 'Paid';
            await fine.save();
            res.json(fine);
        } else {
            res.status(404).json({ message: 'Fine not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { issueFine, getFines, payFine };
