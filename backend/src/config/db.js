const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/duty_roster_db',
      {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4 to avoid IPv6 resolution delays on cloud hosts
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Initial Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Global Mongoose connection error listeners to handle drops on Render free tier
mongoose.connection.on('error', (err) => {
  console.error(`Mongoose runtime connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB. Attempting automatic reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('Mongoose reconnected to MongoDB successfully.');
});

module.exports = connectDB;
