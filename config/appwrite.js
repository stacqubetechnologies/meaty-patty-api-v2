require('dotenv').config(); 

const { Client } = require('appwrite');


const client = new Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT) 
    .setProject(process.env.APPWRITE_PROJECT_ID); 

module.exports = { client, apiKey: process.env.APPWRITE_API_KEY };
