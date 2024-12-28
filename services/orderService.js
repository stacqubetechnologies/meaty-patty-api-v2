const { Databases, Query } = require('appwrite') // Correct class name
const { client } = require('../config/appwrite') // Destructure client from the config file
const PDFDocument = require('pdfkit')
const printer = require('node-printer')
const fs = require('fs')
const nodemailer = require('nodemailer')
require('dotenv').config()

const databases = new Databases(client)

exports.getAllOrderDetails = async () => {
  try {
    const response = await databases.listDocuments(
      '674c41e70028ef203de0',
      '674c434700220c64805a'
    )
    const rawData = response.documents
  } catch (error) {
    // Handle error if needed
  }
}

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465, // Use port 465 for SSL
  secure: true, // 'true' for SSL, 'false' for TLS
  auth: {
    user: process.env.SMTP_EMAIL, // Replace with your email
    pass: process.env.SMTP_PASS // Replace with your email password or app password
  }
})

// Function to generate order confirmation HTML
function generateOrderHTML (orderData) {
  let itemsHTML = ''
  let itemTotal = 0 // Initialize item total

  orderData.OrderedItems.forEach(item => {
    // Accumulate item total
    itemTotal += item.TotalPrice

    // Generate item rows
    itemsHTML += `
         <tr>
        <td>
            ${item.FoodItemName}
            ${item.SelectedDrink ? `<br><small>Drink: ${item.SelectedDrink}</small>` : ''}
            ${item.Salads && item.Salads.length > 0 
                ? `<br><small>Salads: ${item.Salads.join(', ')}</small>` 
                : ''}
            ${item.SelectedSauce ? `<br><small>Sauce: ${item.SelectedSauce}</small>` : ''}
            ${item.selectedSeasoning ? `<br><small>Seasoning: ${item.selectedSeasoning}</small>` : ''}
        </td>
        <td>${item.Quantity}</td>
        <td>£${item.Price}</td> 
        <td>£${item.TotalPrice}</td> 
    </tr>
`;
            })

  // Calculate final total including fees
  const deliveryFee =
    orderData.DeliveryFee === 'FREE'
      ? 0
      : parseFloat(orderData.DeliveryFee.replace('£', '') || 0)

  const serviceFee = orderData.PlatformFee || 0
  const totalAmount = itemTotal + deliveryFee + serviceFee

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
    `

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
                <p><strong>Customer Name:</strong> ${
                  orderData.CustomerData.FirstName
                } ${orderData.CustomerData.LastName}</p>
                <p><strong>Email:</strong> ${orderData.CustomerData.Email}</p>
                <p><strong>Phone:</strong> ${
                  orderData.CustomerData.MobileNo
                }</p>
                <p><strong>Delivery Address:</strong> ${
                  orderData.DeliveryAddress
                }</p>
                <p><strong>Delivery Method:</strong> ${orderData.OrderType}</p>
                <p><strong>Order Note:</strong> ${
                  orderData.DeliveryNotes ? orderData.DeliveryNotes : ''
                }</p>
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
                <p><strong>Transaction Status:</strong> ${
                  orderData.TransactionStatus
                }</p>
            </div>

            <div class="footer">
                <p>If you have any questions, feel free to contact us at <a href="mailto:order@meatypatty.in">order@meatypatty.in</a>.</p>
                <p>Thank you for choosing our restaurant!</p>
            </div>
        </div>
    </body>
    </html>
    `
}

exports.CreateOrderData = async data => {
  try {
    const existingOrderResponse = await databases.listDocuments(
      '674c41e70028ef203de0',
      '674c434700220c64805a',
      [Query.equal('OrderID', data.OrderID)]
    );

    if (existingOrderResponse.documents.length > 0) {
      return {
        success: false,
        message: 'Order with the same Order ID already exists.'
      };
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
        OrderType: data.OrderType
      }
    );

    for (const item of data.OrderedItems) {
      const itemData = {
        ItemID: item.ItemID,
        FoodItemName: item.FoodItemName,
        Quantity: item.Quantity,
        TotalPrice: parseFloat(item.TotalPrice), // Ensure it's a float
        Price: parseFloat(item.Price), // Ensure it's a float
        Customization: item.Customization,
        OrderID: data.OrderID
      };
      await exports.AddOrderedItems(itemData);
    }

    console.log(data);

    // Generate the HTML email body for the restaurant
    const restaurantEmailHTML = generateOrderHTML(data);

    // Send the email to the restaurant
    const restaurantMailOptions = {
      from: 'Restaurant Orders" order@meatypatty.in',
      to: 'meatypattythorne@gmail.com', // Email address of the restaurant
      // to:'adithyainfo811@gmail.com',
      subject: `New Order - ${data.OrderID}`,
      html: restaurantEmailHTML,
    };

    transporter.sendMail(restaurantMailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // Generate the HTML email body for the customer
    const customerEmailHTML = generateCustomerOrderHTML(data);

    // Send the email to the customer
    const customerMailOptions = {
      from: 'Restaurant Orders" order@meatypatty.in',
      to: data.CustomerData.Email, // Customer's email address
      subject: `Order Confirmation - ${data.OrderID}`,
      html: customerEmailHTML,
    };

    transporter.sendMail(customerMailOptions, (error, info) => {
      if (error) {
        console.log('Error sending customer email:', error);
      } else {
        console.log('Customer email sent: ' + info.response);
      }
    });

    return { success: true, order: response };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Function to generate the customer order confirmation email HTML
function generateCustomerOrderHTML(orderData) {
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
            ${item.Salads && item.Salads.length > 0 
                ? `<br><small>Salads: ${item.Salads.join(', ')}</small>` 
                : ''}
            ${item.SelectedSauce ? `<br><small>Sauce: ${item.SelectedSauce}</small>` : ''}
            ${item.selectedSeasoning ? `<br><small>Seasoning: ${item.selectedSeasoning}</small>` : ''}
        </td>
        <td>${item.Quantity}</td>
        <td>£${item.Price}</td> 
        <td>£${item.TotalPrice}</td> 
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
                <p>Dear ${orderData.CustomerData.FirstName},</p>
                <p>Thank you for your order! Here are the details:</p>
            </div>

            <div class="order-details">
                <p><strong>Order ID:</strong> ${orderData.OrderID}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="customer-info">
                <p><strong>Order Time:</strong> ${new Date().toLocaleTimeString()}</p>
                <p><strong>Customer Name:</strong> ${orderData.CustomerData.FirstName} ${orderData.CustomerData.LastName}</p>
                <p><strong>Email:</strong> ${orderData.CustomerData.Email}</p>
                <p><strong>Phone:</strong> ${orderData.CustomerData.MobileNo}</p>
                <p><strong>Delivery Address:</strong> ${orderData.DeliveryAddress}</p>
                <p><strong>Delivery Method:</strong> ${orderData.OrderType}</p>
                <p><strong>Order Note:</strong> ${orderData.DeliveryNotes ? orderData.DeliveryNotes : 'No special instructions'}</p>
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
                <p>If you have any questions, feel free to contact us at +44 7768482257.</p>
                <p>Thank you for choosing our Meaty Patty!</p>
            </div>
        </div>
    </body>
    </html>
  `;
}


exports.AddOrderedItems = async data => {
  try {
    const response = await databases.createDocument(
      '674c41e70028ef203de0',
      '674c434f0025e5a3eefb',
      'unique()',
      data
    )
    return response
  } catch (error) {
    console.error('Error creating menu item:', error)
    throw error
  }
}

exports.getOrdersUserById = async userId => {
  try {
    // Query to get orders by customer ID
    const response = await databases.listDocuments(
      '674c41e70028ef203de0',
      '674c434700220c64805a',
      [
        Query.equal('CustomerId', userId), // Filter orders by CustomerId
        Query.limit(10000)
      ]
    )

    return response.documents // Return orders associated with the user
  } catch (error) {
    console.error('Error fetching orders by user ID:', error)
    throw error // Throw error to be handled by the caller
  }
}

exports.getOrdersWithItemsByUserId = async userId => {
  try {
    // Fetch orders for the user by CustomerId
    const ordersResponse = await databases.listDocuments(
      '674c41e70028ef203de0',
      '674c434700220c64805a',
      [Query.equal('CustomerId', userId), Query.limit(1000)]
    )

    const orders = ordersResponse.documents

    if (orders.length === 0) {
      return {
        success: true,
        orders: [],
        message: 'No orders found for the user.'
      }
    }

    // Fetch ordered items for each order
    const orderIds = orders.map(order => order.OrderID)
    const orderedItemsResponse = await databases.listDocuments(
      '674c41e70028ef203de0',
      '674c434f0025e5a3eefb',
      [
        Query.equal('OrderID', orderIds),
        Query.limit(1000),
        Query.orderDesc('$createdAt')
      ]
    )

    const orderedItems = orderedItemsResponse.documents

    // Attach ordered items to each order
    orders.forEach(order => {
      order.OrderedItems = orderedItems.filter(
        item => item.OrderID === order.OrderID
      )
    })

    return {
      success: true,
      orders,
      message: 'Orders with items fetched successfully.'
    }
  } catch (error) {
    console.error('Error fetching orders with items by user ID:', error)
    throw error // Propagate the error to the caller
  }
}
