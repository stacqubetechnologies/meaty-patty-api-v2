// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();



router.post('/order-webhook', async (req,res)=> {
    try {
        const signature = req.headers['x-appwrite-signature'];
        
        // Validate the secret (optional, recommended)
        if (signature !== SECRET) {
            return res.status(401).send('Unauthorized access.');
        }

        const event = req.body.events;
       
        if (event.includes('databases.collections.documents.create')) {
            console.log('New Order Created:');

            // Call function to send email notification
            // await sendEmail(payload);

            res.status(200).send('Webhook received and processed.');
        } else {
            res.status(200).send('Unhandled event.');
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
