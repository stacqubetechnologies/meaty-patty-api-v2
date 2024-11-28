// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


router.post('/save-order', orderController.createOrder);
router.post('/orderbyusers', orderController.getOrdersWithItemsController);
// router.post('/order-by-users', orderController.getOrderByUserId);


module.exports = router;
