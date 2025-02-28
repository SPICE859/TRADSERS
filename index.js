// index.js
const cors = require('cors');
app.use(cors());
const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

// Initialize the Firebase Admin SDK with your service account
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace with your Realtime Database URL if using Realtime Database,
  // or omit this if only using Firestore:
  // databaseURL: "https://your-project.firebaseio.com"
});

// Initialize Firestore
const db = admin.firestore();

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Sample endpoint: Get all items from the "items" collection in Firestore
app.get('/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sample endpoint: Add a new item to Firestore
app.post('/items', async (req, res) => {
  try {
    const newItem = req.body; // Expecting JSON with at least a 'name' property
    if (!newItem.name) {
      return res.status(400).json({ error: 'Missing "name" property in request body.' });
    }
    const docRef = await db.collection('items').add({
      ...newItem,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ id: docRef.id, message: 'Item added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
