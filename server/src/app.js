const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db.config'); // Assuming you have a file to handle MongoDB connection
const passport = require('./services/auth.service'); // Assuming this handles Google auth with Passport
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  credentials: true // Allows cookies to be included in requests
}));
app.use(express.json()); // Parse JSON bodies

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key for sessions
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport middleware for Google Authentication
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth.routes')); // Authentication routes
app.use('/api/customers', require('./routes/customer.routes')); // Customer-related routes
app.use('/api/orders', require('./routes/order.routes')); // Order-related routes
app.use('/api/campaigns', require('./routes/campaign.routes')); // Campaign-related routes

// Import cron jobs from scheduler.js
require('./services/scheduler'); // This will initialize the cron jobs defined in scheduler.js

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
