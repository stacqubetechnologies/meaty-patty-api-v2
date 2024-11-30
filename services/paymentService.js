const stripe = require('../config/stripe');

exports.createPaymentIntent = async ({ amount, currency }) => {
    try {
     // Ensure amount is provided
if (!amount || !currency) {
    throw new Error('Amount and currency are required.');
}

// Round the amount to 2 decimal places to avoid floating-point precision issues
amount = Math.round(amount * 100) / 100;  // Ensures two decimal places

// Convert the amount to the smallest unit of the given currency
let amountInCents = Math.round(amount * 100); // Default conversion to cents

if (currency.toLowerCase() === 'eur') {
    amountInCents = Math.round(amount * 100); // 2 EUR = 200 cents
} else if (currency.toLowerCase() === 'usd') {
    amountInCents = Math.round(amount * 100); // 2 USD = 200 cents
} else if (currency.toLowerCase() === 'gbp') {
    amountInCents = Math.round(amount * 100); // 2 GBP = 200 pence
} else {
    throw new Error('Unsupported currency');
}

// Service charge (in smallest unit of the currency)
const serviceCharge = 30; // Service charge in pence (0.30 GBP) or equivalent in other currencies
const totalAmount = amountInCents;
console.log(totalAmount)

// Check if the total amount is valid for the currency
const minimumAmounts = {
    usd: 50,  // 50 cents for USD
    eur: 50,  // 50 cents for EUR
    gbp: 30,  // 30 pence for GBP
};

// Ensure the total amount (including service charge) is at least the minimum required
if (totalAmount < (minimumAmounts[currency.toLowerCase()] || 50)) {
    throw new Error(`Total amount (including service charge) must be at least ${minimumAmounts[currency.toLowerCase()] / 100} ${currency.toUpperCase()}.`);
}

// Create the payment intent with Stripe
const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount, // Total amount including service charge
    currency: currency,
    payment_method_types: ['card'],
});

// Return the payment intent and additional details
return {
    paymentIntent,
    serviceCharge,
    totalAmount,
};
    } catch (error) {
        throw new Error(error.message);
    }
};
exports.confirmPayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            return paymentIntent;
        }
        throw new Error('Payment not completed');
    } catch (error) {
        throw new Error(error.message);
    }
};