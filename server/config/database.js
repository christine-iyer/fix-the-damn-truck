const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log(`Successfully connected to MongoDB`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDatabase;