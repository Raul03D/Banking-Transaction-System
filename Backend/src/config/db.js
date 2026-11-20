const mongoose = require('mongoose');

async function connectToDB() {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
        throw new Error('MONGODB_URI is not set');
    }

    try {
        await mongoose.connect(uri);
    } catch (error) {
        if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoServerSelectionError') {
            throw new Error(
                `Could not connect to MongoDB. Check that the Atlas cluster is running, ` +
                `the current IP is in its Network Access list, and MONGODB_URI is correct. ` +
                `Details: ${error.message}`
            );
        }

        throw error;
    }

    console.log(`Connected to MongoDB: ${mongoose.connection.name} (${mongoose.connection.host})`);
}

module.exports = connectToDB;