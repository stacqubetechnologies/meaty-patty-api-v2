const { Databases, Query } = require('appwrite'); // Correct class name
const { client } = require('../config/appwrite'); // Destructure client from the config file

const databases = new Databases(client);

exports.fetchMenu = async () => {
    try {
        const response = await databases.listDocuments(
            '674c41e70028ef203de0',
            '674c4340002982f6210e',
            [
                Query.limit(100),  // Fetch up to 100 documents
            ]
        );

        // Assuming response.documents contains an array of the raw menu data
        const rawMenuData = response.documents;

        // Filter and transform the data into the desired structure
        const foodCategories = rawMenuData.reduce((categories, item) => {
            // Only include items with Status = True
            if (item.Status === true) {
                const {
                    CategoryName: category,
                    FoodItemName: name,
                    Description: description,
                    Price: price,
                    $id
                } = item;

                // Check if the category already exists
                let categoryIndex = categories.findIndex(cat => cat.category === category);

                // If the category doesn't exist, create it
                if (categoryIndex === -1) {
                    categories.push({
                        category,
                        foods: [],
                    });
                    categoryIndex = categories.length - 1; // Update index to new category
                }
                const formattedPrice = parseFloat(price).toFixed(2);

                // Add the food item to the respective category
                categories[categoryIndex].foods.push({
                    name,
                    description,
                    price: formattedPrice, // Use the formatted price
                    quantity: 0, // Default quantity
                    image: "", // Default or replace with an actual field if available
                    category
                });
            }

            return categories;
        }, []);



        return foodCategories;
    } catch (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }
};


exports.createMenu = async (data) => {
    try {

        if (!data) {
            throw new Error('Menu data is missing');
        }

        const response = await databases.createDocument(
            '674c41e70028ef203de0',
            '674c4340002982f6210e',
            'unique()',
             data,
        );

        return response;
    } catch (error) {
        console.error('Error creating menu item:', error);
        throw error;
    }
};
