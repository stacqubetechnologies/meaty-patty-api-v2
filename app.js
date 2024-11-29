const express = require('express');
const app = express();
const cors = require('cors');
const menuRoutes = require('./routes/menuRoute');
const paymentRoutes = require('./routes/paymentRoutes');
const smsRoutes = require('./routes/smsRoutes');
const authRoute = require('./routes/authRoute');
const orderRoute = require('./routes/orderRoute');
const webHookRoute = require('./routes/webhookRoute');

app.use(express.json()); // Parse incoming requests
app.use(cors());
app.use('/api/menu', menuRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/user', authRoute);
app.use('/api/orders', orderRoute);
app.use('/api/webhook', webHookRoute);
module.exports = app;
