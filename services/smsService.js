const twilio = require('twilio')
require('dotenv').config()

const accountSid = process.env.YOUR_ACCOUNT_SID
const authToken = process.env.YOUR_AUTH_TOKEN
const client = twilio(accountSid, authToken)

const sendSms = (to, orderId, amount, shopNumber) => {
  const message = `Your order with Order ID: ${orderId} has been successfully received. 
  The total amount is £${amount}. 
  For any queries, contact Shop Number: ${shopNumber}.`
  return client.messages.create({
    body: message,
    from: '+16814164100', // Replace with your Twilio number
    to: to
  })
}

module.exports = {
  sendSms
}
