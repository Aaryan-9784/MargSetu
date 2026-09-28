const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ No MONGODB_URI provided. Initializing in-memory MongoDB instance for local environment...');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'roadsetu_db',
        },
      });
      mongoUri = mongodInstance.getUri();
      console.log(`✅ In-memory MongoDB initialized at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    console.log(`🏛️ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);

    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_MEMORY_DB_FALLBACK) {
      console.error(
        '\n======================================================\n' +
        '🚨 PRODUCTION MONGODB CONFIGURATION NOTICE:\n' +
        'Failed to connect to the configured MONGODB_URI on Render.\n' +
        'Please verify the following in your Render Dashboard Environment Variables:\n' +
        ' 1. MONGODB_URI username and password are correct in Atlas Database Access.\n' +
        ' 2. MongoDB Atlas Network Access whitelist contains 0.0.0.0/0 (allows Render).\n' +
        ' 3. The connection string includes the database name:\n' +
        '    mongodb+srv://<user>:<password>@<cluster>.mongodb.net/roadsetu?retryWrites=true&w=majority\n' +
        '======================================================\n'
      );
    }

    // Attempt in-memory fallback if not already attempted
    if (!mongodInstance) {
      console.log('🔄 Attempting fallback to in-memory MongoDB instance...');
      try {
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'roadsetu_db',
          },
        });
        const fallbackUri = mongodInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error('❌ Fallback MongoDB connection failed:', fallbackErr.message);
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
