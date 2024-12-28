const dotenv = require('dotenv');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_PROD);
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
module.exports = stripe;

