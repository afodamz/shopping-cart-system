import Product from './models/product';
import RedisClient from "./config/redisClient";
import Database from "./config/db";

const products = [
    { name: 'Laptop', description: "Laptop description", price: 1000, stock: 50 },
    { name: 'Smartphone', price: 500, stock: 100 },
    { name: 'Headphones', price: 100, stock: 200 },
    { name: 'Monitor', price: 300, stock: 150 },
    { name: 'Keyboard', price: 50, stock: 300 },
    { name: 'Mouse', price: 30, stock: 500 }
];

const seedData = async () => {
    try {
        // Step 1: Initialize MongoDB connection
        const db = Database.getInstance();
        await db.connect();

        // Step 2: Clear existing data in the 'products' collection
        await Product.deleteMany({});

        // Step 3: Insert seed data into MongoDB
        const insertedProducts = await Product.insertMany(products);
        console.log('Seeded products:', insertedProducts);

        // Step 4: Optionally, initialize Redis and cache data
        const redis = RedisClient.getInstance();
        await redis.connect();

        // Preload product stock counts into Redis for fast access
        for (const product of insertedProducts) {
            await redis.getClient().set(`product_stock:${product._id}`, product.stock);
        }

        console.log('Product stock counts cached in Redis');

        // Step 5: Disconnect the database and Redis connection
        await db.disconnect();
        await redis.disconnect();

        console.log('Database and Redis connections closed.');
    } catch (err) {
        console.error('Error seeding database:', err);
    }
};

seedData();
