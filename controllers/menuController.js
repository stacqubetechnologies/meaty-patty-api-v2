const menuService = require('../services/menuService')

exports.getMenu = async (req, res) => {
    try {
        const menu = await menuService.fetchMenu();
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.createMenu = async (req, res) => {
    try {
        const {CategoryName, FoodItemName, Description, Price } = req.body;
        if (!CategoryName || !FoodItemName ) {
            return res.status(400).json({ error: 'CategoryName, FoodItemName, and Price are required' });
        }
        // Ensure Price is a valid float
        const formattedPrice = parseFloat(Price).toFixed(2);
        if (isNaN(formattedPrice)) {
            return res.status(400).json({ error: 'Invalid Price format. Price must be a valid float.' });
        }
        const menuData = {
           
            CategoryName,
            FoodItemName,
            Description: Description || '',  
            Price: formattedPrice,            
        };
        const newMenuItem = await menuService.createMenu(menuData);
        res.status(201).json(newMenuItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Error creating menu item' });
    }
};
