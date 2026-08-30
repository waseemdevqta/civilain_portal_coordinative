const mongoose = require('mongoose');

let mongod = null;

/**
 * Connect to MongoDB Atlas with resilient timeout and memory fallback
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (uri && !uri.includes('your_username')) {
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 to prevent SRV lookup latency on Linux/Fedora
      });
      console.log(`[MongoDB Atlas Connected]: ${conn.connection.host} (${conn.connection.name})`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB Warning]: Atlas primary connection failed (${error.message}).`);
      if (process.env.NODE_ENV === 'production') {
        console.error('[MongoDB Connection Error]: Cannot fallback in production.');
        process.exit(1);
      }
    }
  }

  // Development/Testing fallback using MongoMemoryServer if external cluster is inaccessible
  try {
    if (!mongod) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
    }
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB Memory Server Connected]: ${memoryUri}`);
    return conn;
  } catch (memError) {
    console.error(`[MongoDB Memory Fallback Error]: ${memError.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
  } catch (error) {
    console.error(`[MongoDB Disconnect Error]: ${error.message}`);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
