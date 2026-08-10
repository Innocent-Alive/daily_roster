const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/areas', require('./routes/areaRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/duty-assignments', require('./routes/dutyRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

const https = require('https');
const mongoose = require('mongoose');

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'OK',
    message: 'Duty Roster API running smoothly',
    database: states[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Automated self-ping to prevent Render free instance from spinning down (sleeps after 15 min inactivity)
  const renderUrl = process.env.RENDER_EXTERNAL_URL || 'https://daily-roster.onrender.com';
  if (renderUrl) {
    setInterval(() => {
      https.get(`${renderUrl}/api/health`, (res) => {
        console.log(`Keep-alive ping sent to ${renderUrl}/api/health - Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.warn(`Keep-alive ping warning: ${err.message}`);
      });
    }, 14 * 60 * 1000); // 14 minutes
  }
});
