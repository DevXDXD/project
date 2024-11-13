const { body, validationResult } = require('express-validator');
const queueService = require('../services/queue.service');

// Validation middleware
exports.validateOrder = [
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
];

// Create order handler
exports.createOrder = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const order = req.body;
    console.log(`[x] Creating order with payload: ${JSON.stringify(order)}`);
    
    // Ensure customerId is present
    if (!order.customerId) {
      return res.status(400).json({ error: 'CustomerId is required' });
    }

    await queueService.publishMessage({ type: 'CREATE_ORDER', payload: order });
    res.status(201).json(order);
  } catch (err) {
    console.error(`[x] Error creating order: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};
