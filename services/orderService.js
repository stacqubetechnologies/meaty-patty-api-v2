const { Databases,Query } = require('appwrite'); // Correct class name
const { client } = require('../config/appwrite'); // Destructure client from the config file
const PDFDocument = require('pdfkit');
const printer = require('node-printer');
const fs = require('fs');
const databases = new Databases(client);
const nodemailer = require('nodemailer');
require('dotenv').config(); 


exports.getAllOrderDetails = async () => {
    try{
        const response = await databases.listDocuments(
            '674c41e70028ef203de0',
            '674c434700220c64805a'
        );

        const rawData = response.documents


    }catch(error)
    {

    }
}

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465, // Use port 465 for SSL
    secure: true,  // 'true' for SSL, 'false' for TLS
    auth: {
        user: process.env.SMTP_EMAIL, // Replace with your email
        pass: process.env.SMTP_PASS, // Replace with your email password or app password
    },
});

// Function to generate order confirmation HTML
function generateOrderHTML(orderData) {
    let itemsHTML = '';
let itemTotal = 0; // Initialize item total

orderData.OrderedItems.forEach(item => {
    // Accumulate item total
    itemTotal += item.TotalPrice;

    // Generate item rows
    itemsHTML += `
        <tr>
            <td>
                ${item.FoodItemName}
                ${item.SelectedDrink ? `<br><small>Drink: ${item.SelectedDrink}</small>` : ''}
                ${item.Sauces && item.Sauces.length > 0 
                    ? `<br><small>Sauces: ${item.Sauces.join(', ')}</small>` 
                    : ''}
            </td>
            <td>${item.Quantity}</td>
            <td>£${item.Price}</td> <!-- Format the price to 2 decimal places -->
            <td>£${item.TotalPrice}</td> <!-- Format the total price to 2 decimal places -->
        </tr>
    `;
});

// Calculate final total including fees
const deliveryFee =
  orderData.DeliveryFee === 'FREE'
    ? 0
    : parseFloat(orderData.DeliveryFee.replace('£', '') || 0);

const serviceFee = orderData.PlatformFee || 0;
const totalAmount = itemTotal + deliveryFee + serviceFee;

// Add the summary row for total
itemsHTML += `
    <tr>
        <td colspan="3"><strong>Delivery Fee</strong></td>
        <td>${deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}</td>
    </tr>
    <tr>
        <td colspan="3"><strong>Service Fee</strong></td>
        <td>£${serviceFee.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="3"><strong>Total Amount</strong></td>
        <td>£${totalAmount.toFixed(2)}</td>
    </tr>
`;

    

    

    return `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
            .container { width: 100%; max-width: 800px; margin: 0 auto; background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { font-size: 36px; color: #333; }
            .order-details, .customer-info, .items-list, .payment-info { margin-bottom: 20px; }
            .items-list table { width: 100%; border-collapse: collapse; }
            .items-list table th, .items-list table td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            .items-list table th { background-color: #f1f1f1; color: #333; }
            .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 10px; }
            .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
                <p>Thank you for your order! Here are the details:</p>
            </div>

            <div class="order-details">
                <p><strong>Order ID:</strong> ${orderData.OrderID}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="customer-info">
                <p><strong>Order Time:</strong> ${new Date().toLocaleTimeString()}</p>
                <p><strong>Customer Name:</strong> ${orderData.CustomerData.FirstName}  ${orderData.CustomerData.LastName}</p>
                <p><strong>Email:</strong> ${orderData.CustomerData.Email}</p>
                <p><strong>Phone:</strong> ${orderData.CustomerData.MobileNo}</p>
                <p><strong>Delivery Address:</strong> ${orderData.DeliveryAddress}</p>
                <p><strong>Delivery Method:</strong> ${orderData.OrderType}</p>
            </div>

            <div class="items-list">
                <h3>Ordered Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
            </div>

            <div class="payment-info">
             
                <p><strong>Transaction Status:</strong> ${orderData.TransactionStatus}</p>
            </div>

            <div class="footer">
                <p>If you have any questions, feel free to contact us at <a href="mailto:order@meatypatty.in">order@meatypatty.in</a>.</p>
                <p>Thank you for choosing our restaurant!</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

exports.CreateOrderData = async (data) => {
    try {
        const existingOrderResponse = await databases.listDocuments(
            '674c41e70028ef203de0',
            '674c434700220c64805a',
            [Query.equal('OrderID', data.OrderID)]
        );

        if (existingOrderResponse.documents.length > 0) {
            return { success: false, message: 'Order with the same Order ID already exists.' };
        }

        const response = await databases.createDocument(
             '674c41e70028ef203de0',
            '674c434700220c64805a',
            'unique()',
            {
                CustomerId: data.CustomerId,
                TotalAmount: data.TotalAmount,
                DeliveryAddress: data.DeliveryAddress,
                DeliveryNotes: data.DeliveryNotes,
                DeliveryStatus: data.DeliveryStatus,
                TransactionId: data.TransactionId,
                TransactionStatus: data.TransactionStatus,
                OrderID: data.OrderID,
                OrderType:data.OrderType
            }
        );

        for (const item of data.OrderedItems) {
            const itemData = {
                ItemID: item.ItemID,
                FoodItemName: item.FoodItemName,
                Quantity: item.Quantity,
                TotalPrice: parseFloat(item.TotalPrice),  // Ensure it's a float
        Price: parseFloat(item.Price),            // Ensure it's a float
                Customization: item.Customization,
                OrderID: data.OrderID
            };
            await exports.AddOrderedItems(itemData);
        }
        console.log(data)

        // Generate the HTML email body
        const emailHTML = generateOrderHTML(data);

        // Send the email to restaurant 
        const mailOptions = {
            from: 'Restaurant Orders" order@meatypatty.in',
            to: 'meatypattythorne@gmail.com', // Email address of the restaurant
            // to: 'adithyainfo811@gmail.com', // Email address of the restaurant
            subject: `New Order - ${data.OrderID}`,
            html: emailHTML,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // Generate and print the invoice (optional)
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
        console.log(printerInstance)
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
        '674c41e70028ef203de0',
        '674c434f0025e5a3eefb',
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
           '674c41e70028ef203de0',
            '674c434700220c64805a',
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
            '674c41e70028ef203de0',
            '674c434700220c64805a',
            [Query.equal('CustomerId', userId)]
        );

        const orders = ordersResponse.documents;

        if (orders.length === 0) {
            return { success: true, orders: [], message: 'No orders found for the user.' };
        }

        // Fetch ordered items for each order
        const orderIds = orders.map(order => order.OrderID);
        const orderedItemsResponse = await databases.listDocuments(
            '674c41e70028ef203de0', // Database ID
            '674c434f0025e5a3eefb', // Collection ID for Ordered Items
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

