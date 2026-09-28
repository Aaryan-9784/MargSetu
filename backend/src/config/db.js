const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ No MONGODB_URI provided. Initializing in-memory MongoDB instance for local/hackathon environment...');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'roadsetu_db'
        }
      });
      mongoUri = mongodInstance.getUri();
      console.log(`✅ In-memory MongoDB initialized at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🏛️ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    // If external URI failed, attempt memory server fallback
    if (!mongodInstance) {
      console.log('🔄 Attempting fallback to in-memory MongoDB instance...');
      try {
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'roadsetu_db'
          }
        });
        const fallbackUri = mongodInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error('❌ Fallback MongoDB connection failed:', fallbackErr);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
