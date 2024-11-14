// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const passport = require('../services/auth.service');
require('dotenv').config();

// Username and Password Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the provided credentials match the environment variables
  if (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  ) {
    req.session.isAuthenticated = true; // Mark session as authenticated
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Google Authentication Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to the client application
    req.session.isAuthenticated = true; // Set the session as authenticated
    res.redirect('http://localhost:3000/home');
  }
);

// Route to check authentication status
router.get('/status', (req, res) => {
  res.json({ isAuthenticated: req.session.isAuthenticated || false });
});

// Logout Route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to destroy session' });
      }

      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

module.exports = router;
