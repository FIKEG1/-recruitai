const mongoose = require('mongoose');

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = 'mongodb://127.0.0.1:27017/recruitai';

    try {
        const conn = await mongoose.connect(primaryUri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`✅ MongoDB Connected (Primary Atlas): ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (primaryError) {
        console.warn(`⚠️ Primary MongoDB Atlas connection failed (${primaryError.message}). Attempting fallback to local MongoDB...`);
        try {
            const conn = await mongoose.connect(fallbackUri, {
                serverSelectionTimeoutMS: 5000
            });
            console.log(`✅ Fallback Local MongoDB Connected: ${conn.connection.host}`);
            console.log(`📊 Database: ${conn.connection.name}`);
        } catch (fallbackError) {
            console.error(`❌ Connection to primary Atlas and local fallback MongoDB both failed.`);
            console.error(`Primary Error: ${primaryError.message}`);
            console.error(`Fallback Error: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;