// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePaymentRequest } = require('../middleware/validators');

router.post('/create-intent', validatePaymentRequest, paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);

module.exports = router;
