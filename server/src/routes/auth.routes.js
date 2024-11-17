const express = require('express');
const { v4: uuidv4 } = require('uuid'); 
const router = express.Router();
const passport = require('../services/auth.service');
require('dotenv').config();

// Username and Password Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  try {
    if (
      username === process.env.APP_USERNAME &&
      password === process.env.APP_PASSWORD
    ) {
      // Mark session as authenticated
      req.session.isAuthenticated = true;

   
      const userId = process.env.APP_USER_ID || uuidv4(); // Generate a unique ID
      req.session.userId = userId; 
      res.json({ success: true, message: 'Login successful', userId });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
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
    req.session.isAuthenticated = true;
    req.session.googleId = req.user.googleId; // Store googleId in session

    const redirectUrl = `http://localhost:3000/home?googleId=${req.user.googleId}`;
    res.redirect(redirectUrl);
  }
);

// Route to check authentication status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.session.isAuthenticated || false,
    googleId: req.session.googleId || req.session.userId || null, // Send googleId or userId
  });
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
