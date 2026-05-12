const mongoose = require('mongoose');

let connectionPromise = null;
let lastConnectionError = null;

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MongoDB connection skipped: set MONGO_URI to enable persistence.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      retryWrites: true,
    });
  }

  try {
    await connectionPromise;
    lastConnectionError = null;
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    lastConnectionError = error;
    console.warn(`MongoDB connection failed: ${error.message}`);
    return null;
  }
};

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const getDatabaseConnectionError = () => lastConnectionError;

module.exports = {
  connectDatabase,
  isDatabaseConnected,
  getDatabaseConnectionError,
};