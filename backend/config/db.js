const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Missing MongoDB connection string. Set MONGODB_URI in .env');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Fail fast if MongoDB isn't reachable (helps dev UX + avoids hanging startup)
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Fail fast so we don't run the app without DB.
    process.exit(1);
  }
}

module.exports = connectDB;

