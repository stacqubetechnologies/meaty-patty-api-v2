
exports.validatePaymentRequest = (req, res, next) => {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    next();
};
