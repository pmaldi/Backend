const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB OK');
    } catch (error) {
        console.error('MongoDB KO');
        console.error(error);
        process.exit(1);
    }
}

module.exports = connectDB;