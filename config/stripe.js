const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_PROD);
module.exports = stripe;
