
const paymentService = require('../services/paymentService');
const { successResponse, errorResponse } = require('../utils/formatResponse');

exports.createPaymentIntent = async (req, res) => {
    try {
        
        const { amount, currency } = req.body;


        if (!amount || !currency) {
            return res.status(400).json({
                success: false,
                message: 'Amount and currency are required.',
            });
        }

       
        const { paymentIntent, serviceCharge, totalAmount } = await paymentService.createPaymentIntent({
            amount,
            currency,
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret, 
            serviceCharge: serviceCharge / 100,         
            totalAmount: totalAmount / 100,            
        });
    } catch (error) {
       
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const paymentIntent = await paymentService.confirmPayment(paymentIntentId);
        res.status(200).json({
            success: true,
            paymentIntent,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
