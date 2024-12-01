const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
    try {
        const { CustomerId, TotalAmount, DeliveryAddress, DeliveryNotes, DeliveryStatus, TransactionId, TransactionStatus,OrderedItems,CustomerData,OrderType } = req.body;
        const orderData = {
            CustomerId,
            TotalAmount,
            DeliveryAddress,
            DeliveryNotes,
            DeliveryStatus,
            TransactionId,
            TransactionStatus,
            OrderID:generateCustomOrderId(),
            OrderedItems,
            CustomerData,
            OrderType:OrderType
        };
        const orderDetails = await orderService.CreateOrderData(orderData)
        return res.status(201).json({ success: true, order: orderDetails });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

function generateCustomOrderId() {
    
    const orderNumber = Math.floor(10000 + Math.random() * 90000); 
    const orderId = `ODR-MP-${orderNumber.toString().padStart(5, '0')}`;
    return orderId;
}

exports.getOrderByUserId = async (req, res) => {
    try {
        const { userId } = req.body;
        const orderDetails = await orderService.getOrdersUserById(userId)
        return res.status(201).json({ success: true, order: orderDetails });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getOrdersWithItemsController = async (req, res) => {
    const { userId } = req.body; // Assuming userId is passed as a route parameter

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
    }

    const result = await orderService.getOrdersWithItemsByUserId(userId);

    if (result.success) {
        res.status(200).json({ success: true, orders: result.orders });
    } else {
        res.status(500).json({ success: false, error: result.error });
    }
};


