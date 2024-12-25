const dotenv = require('dotenv');

// Load environment variables based on the current NODE_ENV value
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config(); // This will load the .env file by default
}

// Conditionally set the stripe secret key based on the environment
const stripeSecretKey = process.env.NODE_ENV === 'production'
  ? process.env.STRIPE_SECRET_KEY_PROD
  : process.env.STRIPE_SECRET_KEY_DEV;

// Initialize Stripe with the correct secret key
const stripe = require('stripe')(stripeSecretKey);


// Set the correct SMTP email based on the environment
const smtpEmail = process.env.NODE_ENV === 'production'
  ? process.env.SMTP_EMAIL_PROD
  : process.env.SMTP_EMAIL_DEV;
console.log('Using SMTP Email:', smtpEmail);

// Export stripe for use in other modules
module.exports = stripe;
