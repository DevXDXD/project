const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog');

// Fetch all campaigns for admin view
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await CommunicationLog.find().sort({ scheduledAt: -1 }); // Sort by scheduled date
    res.status(200).json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns for admin:', err);
    res.status(500).json({ error: 'An error occurred while fetching campaigns.' });
  }
});

module.exports = router;
