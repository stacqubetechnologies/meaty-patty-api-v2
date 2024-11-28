const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.post('/add-address', userController.addAddressController);
router.post('/get-addressbyuser', userController.getAddressListController);

module.exports = router;
