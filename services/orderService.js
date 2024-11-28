const { Databases,Query } = require('appwrite'); // Correct class name
const { client } = require('../config/appwrite'); // Destructure client from the config file
const PDFDocument = require('pdfkit');
const printer = require('node-printer');
const fs = require('fs');
const databases = new Databases(client);

exports.getAllOrderDetails = async () => {
    try{
        const response = await databases.listDocuments(
            '6743e5aa002d92d243ac',
            '67440c970022594b45e0'
        );

        const rawData = response.documents


    }catch(error)
    {

    }
}
exports.CreateOrderData = async (data) => {
    try {
        // Check if order already exists with the same OrderID
        const existingOrderResponse = await databases.listDocuments(
            '6743e5aa002d92d243ac',
            '67440c970022594b45e0',
            [Query.equal('OrderID', data.OrderID)]
        );

        if (existingOrderResponse.documents.length > 0) {
            // If an order with the same OrderID exists, return an error
            return { success: false, message: 'Order with the same Order ID already exists.' };
        }

        // Proceed to create the new order if no duplicate found
        const response = await databases.createDocument(
            '6743e5aa002d92d243ac',
            '67440c970022594b45e0',
            'unique()',
            {
                CustomerId: data.CustomerId,
                TotalAmount: data.TotalAmount,
                DeliveryAddress: data.DeliveryAddress,
                DeliveryNotes: data.DeliveryNotes,
                DeliveryStatus: data.DeliveryStatus,
                TransactionId: data.TransactionId,
                TransactionStatus: data.TransactionStatus,
                OrderID: data.OrderID
            }
        );

        // Add ordered items for the new order
        for (const item of data.OrderedItems) {
            const itemData = {
                ItemID: item.ItemID,
                FoodItemName: item.FoodItemName,
                Quantity: item.Quantity,
                TotalPrice: item.TotalPrice,
                Price: item.Price,
                Customization: item.Customization,
                OrderID: data.OrderID
            };
            await exports.AddOrderedItems(itemData);
        }

        // Generate and print the invoice
        const invoicePath = `./invoices/Invoice-${response.$id}.pdf`;
        generateAndPrintInvoice(data, invoicePath);

        return { success: true, order: response };

    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};


// Function to generate and print PDF invoice
function generateAndPrintInvoice(orderData, filePath) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(`Invoice`, { align: 'center' });
    doc.text(`Order ID: ${orderData.OrderID}`, 50, 100);
    doc.text(`Customer ID: ${orderData.CustomerId}`);
    doc.text(`Delivery Address: ${orderData.DeliveryAddress}`);
    doc.text(`Total Amount: ${orderData.TotalAmount}`);
    doc.text(`Transaction Status: ${orderData.TransactionStatus}`);

    doc.moveDown();
    doc.fontSize(15).text(`Ordered Items:`);
    orderData.OrderedItems.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.FoodItemName} - Qty: ${item.Quantity} - $${item.TotalPrice}`);
    });

    doc.end();

    // Print the PDF automatically
    doc.on('finish', () => {
        const printerInstance = printer.getDefaultPrinterName();
        printer.printFile({
            filename: filePath,
            printer: printerInstance,
            success: () => {
                console.log('Print job sent successfully.');
            },
            error: (err) => {
                console.error('Error in printing:', err);
            }
        });
    });
}


exports.AddOrderedItems = async (data) => {
try {
    const response = await databases.createDocument(
        '6743e5aa002d92d243ac',
        '67440ee90012e64d8fff',
        'unique()',
         data,
    );
    return response;
} catch (error) {
    console.error('Error creating menu item:', error);
        throw error;
}
}



exports.getOrdersUserById = async (userId) => {
    try {
        // Query to get orders by customer ID
        const response = await databases.listDocuments(
            '6743e5aa002d92d243ac', 
            '67440c970022594b45e0',
            [
                Query.equal('CustomerId', userId) // Filter orders by CustomerId
            ]
        );

        return response.documents; // Return orders associated with the user

    } catch (error) {
        console.error('Error fetching orders by user ID:', error);
        throw error; // Throw error to be handled by the caller
    }
}



exports.getOrdersWithItemsByUserId = async (userId) => {
    try {
        // Fetch orders for the user by CustomerId
        const ordersResponse = await databases.listDocuments(
            '6743e5aa002d92d243ac', // Database ID
            '67440c970022594b45e0', // Collection ID for Orders
            [Query.equal('CustomerId', userId)]
        );

        const orders = ordersResponse.documents;

        if (orders.length === 0) {
            return { success: true, orders: [], message: 'No orders found for the user.' };
        }

        // Fetch ordered items for each order
        const orderIds = orders.map(order => order.OrderID);
        const orderedItemsResponse = await databases.listDocuments(
            '6743e5aa002d92d243ac', // Database ID
            '67440ee90012e64d8fff', // Collection ID for Ordered Items
            [Query.equal('OrderID', orderIds)]
        );

        const orderedItems = orderedItemsResponse.documents;

        // Attach ordered items to their corresponding orders
        const ordersWithItems = orders.map(order => {
            const items = orderedItems.filter(item => item.OrderID === order.OrderID);
            return { ...order, orderedItems: items };
        });

        return { success: true, orders: ordersWithItems };
    } catch (error) {
        console.error('Error fetching orders with items:', error);
        return { success: false, error: error.message };
    }
};

