const Customer = require('../models/Customer');
const { publishMessage } = require('../services/queue.service');
const { body, validationResult } = require('express-validator');

exports.createCustomer = async (req, res) => {
  try {
    console.log('[x] Received request to create customer with data:', req.body);

    // Validation rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[x] Validation error:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    // Check for name and email fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if the email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const customer = new Customer({ name, email });
    console.log('[x] Customer object created:', customer);

    // Save the customer to the database
    const savedCustomer = await customer.save();
    console.log('[x] Customer saved to database:', savedCustomer);

    res.status(201).json(savedCustomer);
  } catch (err) {
    console.error('[x] Error creating customer:', err.message);
    res.status(500).json({ error: 'Error creating customer' });
  }
};

// Validation middleware
exports.validateCreateCustomer = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be a valid email address'),
];