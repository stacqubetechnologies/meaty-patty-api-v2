// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const SECRET = 'a068e11f745672ec531faf1ec1fc4ff1b529b3a12e37e114aa87284b33fdbe007890e5b601c14f2b8e66886a42b6ac51c1825c44613b75435073e228820d909d';


router.post('/order-webhook', async (req,res)=> {
    try {
        const signature = req.headers['x-appwrite-signature'];
        
        // Validate the secret (optional, recommended)
        if (signature !== SECRET) {
            return res.status(401).send('Unauthorized access.');
        }

        const event = req.body.events;
       
        if (event.includes('databases.collections.documents.create')) {


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
