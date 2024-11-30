const { Databases, Account, ID } = require('appwrite');
const { client } = require('../config/appwrite');
const jwt = require('jsonwebtoken');
const sdk = require('node-appwrite');
require('dotenv').config();

const databases = new Databases(client);
const account = new Account(client);


exports.createUser = async (email, password, firstName, lastName, mobileNo, postalCode, houseAppart, city, street) => {
    try {
        const user = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);
        await databases.createDocument(
            '6743e5aa002d92d243ac',
            '6745e0a1000a7c84f409',
            'unique()',
            {
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                MobileNo: '+91' + mobileNo,  // Add +91 prefix to mobile number
                UserId: user.$id
            }

        );
        await databases.createDocument(
            '6743e5aa002d92d243ac',
            '67469ff400226044f57d',
            ID.unique(),
            {
                UserId: user.$id,
                PostalCode: postalCode,
                HouseAppart: houseAppart,
                City: city,
                Street: street,
            
            }
        );
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
exports.loginUser = async (email, password) => {
    if (!email || !password) {
        return {
            success: false,
            error: 'Email and password are required.',
        };
    }

    try {
        const session = await account.createEmailPasswordSession(email, password);

        // Correct query format with single quotes around the userId value
        const userDetails = await databases.listDocuments(
            '6743e5aa002d92d243ac',  // Database ID
            '6745e0a1000a7c84f409',  // Collection ID
        );

        const user = userDetails.documents.find(doc => doc.UserId === session.userId)





        const token = jwt.sign({
            userId: session.userId,
            email: email,
            sessionId: session.$id,
            expiry: session.expire,
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' });

        return { success: true, token, session, user };
    } catch (error) {
        console.error('Login Error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred during login.',
        };
    }
};

exports.validateSession = async () => {
    try {
        const session = await account.get();
        return { success: true, user: session };
    } catch (error) {
        return { success: false, error: error.message };
    }
};


exports.addAddress = async (userId, postalCode, houseAppart, city, street) => {

    try {
        await databases.createDocument(
            '6743e5aa002d92d243ac',
            '67469ff400226044f57d',
            ID.unique(),
            {
                UserId: userId,
                PostalCode: postalCode,
                HouseAppart: houseAppart,
                City: city,
                Street: street,
              
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};


exports.listUserAddresses = async (userId) => {
    try {
        const addressList = await databases.listDocuments(
            '6743e5aa002d92d243ac',  // Database ID
            '67469ff400226044f57d'   // Collection ID for addresses
        );

        // Filter the documents to only include those matching the given UserId
        const userAddresses = addressList.documents.filter(doc => doc.UserId === userId);

        return {
            success: true,
            addresses: userAddresses
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

