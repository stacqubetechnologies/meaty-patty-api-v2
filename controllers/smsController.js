const smsService = require('../services/smsService');

const sendSms = async (req, res) => {
    try {
      const { to, orderId, amount, shopNumber } = req.body;
  
      // Validate the required fields
      if (!to || !orderId || !amount || !shopNumber) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
  
      // Call the service to send the SMS
      const response = await smsService.sendSms(to, orderId, amount, shopNumber);
  
      // Send success response
      res.status(200).json({ success: true, sid: response.sid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  module.exports = {
    sendSms,
  };