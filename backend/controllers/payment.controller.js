const razorpayInstance = require('../config/razorpay');
const Fine = require('../models/Fine');
const crypto = require('crypto');
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');

/**
 * @desc    Create Razorpay order for a fine
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createOrder = async (req, res) => {
    try {
        const { fineId } = req.body;

        if (!fineId) {
            return res.status(400).json({ message: 'Fine ID is required' });
        }

        const fine = await Fine.findById(fineId);

        if (!fine) {
            return res.status(404).json({ message: 'Fine not found' });
        }

        // Validate status
        if (fine.status !== 'Pending') {
            return res.status(400).json({ message: `Fine status is already ${fine.status}` });
        }

        // Optional: Ownership check (ensure shopkeeper is paying their own fine)
        if (req.user.role === 'shopkeeper' && fine.shop_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to pay this fine' });
        }

        const options = {
            amount: Math.round(fine.amount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${fine._id}`,
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
    }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payment/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, fineId } = req.body;

        const isValid = validatePaymentVerification(
            { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
            razorpay_signature,
            process.env.RAZORPAY_KEY_SECRET.trim()
        );

        if (isValid) {
            // Payment is authentic
            // Now update the fine status to 'Paid'
            if (fineId) {
                const fine = await Fine.findById(fineId);
                if (fine) {
                    fine.status = 'Paid';
                    fine.razorpay_order_id = razorpay_order_id;
                    fine.razorpay_payment_id = razorpay_payment_id;
                    fine.razorpay_signature = razorpay_signature;
                    await fine.save();
                } else {
                    return res.status(404).json({ message: 'Payment verified, but fine not found.' });
                }
            }

            return res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid signature sent!' });
        }
    } catch (error) {
        console.error('Razorpay Verify Error:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
