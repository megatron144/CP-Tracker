const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const contestRoutes = require('./routes/contestRoutes');
const { startBackgroundSync } = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contests', contestRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CP-Tracker Backend is running!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on:`);
  console.log(`  > Local:   http://localhost:${PORT}`);
  console.log(`  > Network: http://0.0.0.0:${PORT}`);
  // Start scheduled background stats refresh (every 6 hours)
  startBackgroundSync();
});
