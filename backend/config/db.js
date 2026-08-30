const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (uri && !uri.includes('your_username')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB Warning]: Primary connection to MongoDB URI failed (${error.message}).`);
      if (process.env.NODE_ENV === 'production') {
        console.error('[MongoDB Connection Error]: Cannot fallback in production.');
        process.exit(1);
      }
    }
  }

  // Development/Testing fallback using MongoMemoryServer if external cluster is inaccessible
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
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
    }
  } catch (error) {
    console.error(`[MongoDB Disconnect Error]: ${error.message}`);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
