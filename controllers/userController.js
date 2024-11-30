
const authService = require('../services/userService');
require('dotenv').config();
const jwt = require('jsonwebtoken'); 

// Register User Controller
exports.registerUser = async (req, res) => {
    const { email, password, firstName,lastName,mobileNo,homePhone,postalCode,houseAppart,city,street,userId } = req.body;
    
    const result = await authService.createUser(email, password, firstName,lastName,mobileNo,homePhone,postalCode,houseAppart,city,street);

    if (result.success) {
        res.status(201).json({
            message: 'User created successfully',
           
            user: {
                id: result.user.$id,
                email: result.user.email,
                name: result.user.name,
            },
        });
    } else {
        res.status(400).json({ error: result.error });
    }
};

// Login User Controller
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (result.success) {
        console.log(result)
        res.status(200).json({
            message: 'Login successful',
            token: result.token,
            session: {
                sessionId: result.session.$id,
                userId: result.session.userId,
                expiry: result.session.expire,
            },
            userDetails:result.user
        });
    } else {
        res.status(401).json({ error: result.error });
    }
};

// Validate Session Controller
exports.validateSession = async (req, res) => {
    const result = await authService.validateSession();

    if (result.success) {
        res.status(200).json({
            message: 'Session is valid',
            user: {
                id: result.user.$id,
                email: result.user.email,
                name: result.user.name,
            },
        });
    } else {
        res.status(401).json({ error: result.error });
    }
};




exports.addAddressController = async (req, res) => {
    const { userId, postalCode, houseAppart, city, street,lat,long } = req.body;

    if (!userId || !postalCode || !houseAppart || !city || !street  || !lat  || !long) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        // Call the addAddress service
        const result = await authService.addAddress(userId, postalCode, houseAppart, city, street,lat,long);

        if (result.success) {
            return res.status(201).json({ success: true, message: 'Address added successfully' });
        } else {
            return res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAddressListController = async (req, res) => {
    const { userId } = req.body; // Assuming userId is passed as a route parameter
    

    if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        // Call the authService method to fetch the addresses
        const result = await authService.listUserAddresses(userId);

        if (result.success) {
            res.status(200).json({
                success: true,
                addresses: result.addresses,
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
