// backend/server.js
// Firebase Node.js Backend Server
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (requires your serviceAccountKey.json)
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
app.use(cors());
app.use(express.json());

// Mock In-Memory DB (Replace with Firebase Firestore in Prod)
let ticketsAvailable = 100;

// POST /api/auth/register (Firebase wrapper hook)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Creates user in Firebase Authentication
    // const userRecord = await admin.auth().createUser({ email, password, displayName: name });
    res.status(201).json({ message: "User registered successfully", role: email.includes('admin') ? 'admin' : 'student' });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/tickets
app.get('/api/tickets', (req, res) => {
  res.json({ availableTickets: ticketsAvailable });
});

// POST /api/tickets/adjust (Admin Only Route)
app.post('/api/tickets/adjust', (req, res) => {
  const { role, action } = req.body;
  
  if (role !== 'admin') return res.status(403).json({ error: "Access denied. Admins only." });

  if (action === 'increase') ticketsAvailable += 10;
  if (action === 'decrease') ticketsAvailable = Math.max(0, ticketsAvailable - 10);
  
  res.json({ availableTickets: ticketsAvailable });
});

// POST /api/book
app.post('/api/book', (req, res) => {
  const { amount } = req.body;
  if (amount > ticketsAvailable) return res.status(400).json({ error: "Not enough tickets."});
  ticketsAvailable -= amount;
  res.json({ success: true, ticketsAvailable });
});

app.listen(5000, () => console.log('Node Server started on http://localhost:5000'));
