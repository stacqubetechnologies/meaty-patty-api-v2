const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateJWT } = require('../middleware/authMiddleWare');

router.get('/', menuController.getMenu);
router.post('/', menuController.createMenu);

module.exports = router;
