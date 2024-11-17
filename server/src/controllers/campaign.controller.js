const { validationResult, body } = require('express-validator');
const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');
const queueService = require('../services/queue.service');

const User = require('../models/User'); // Ensure the User model is imported

// Creates a scheduled or regular campaign with a thank-you message
exports.createScheduledCampaign = async (req, res) => {
  try {
    console.log('Received request to create scheduled campaign:', req.body);

    await validateCreateCampaignRequest(req);

    const { rules, message, logicalOperator, scheduledAt, isAutomated, trigger } = req.body;

    // Retrieve googleId from request body or session
    const googleId = req.body.googleId || req.session?.googleId;
    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required' });
    }

    // Fetch user details to get firstName
    const user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get audience size
    const audience = await getAudienceSize(rules, logicalOperator);
    const audienceSize = audience.length;

    // Create and save the communication log
    const communicationLog = new CommunicationLog({
      googleId, // Use googleId instead of userId
      audience,
      message,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? 'PENDING' : 'SENT',
      isAutomated: isAutomated || false,
      trigger: trigger || null,
    });

    await communicationLog.save();
    console.log('Communication log saved:', communicationLog);

    // If not scheduled, send immediately
    if (!scheduledAt) {
      await exports.sendCampaign(communicationLog);
    }

    // Send response with a thank-you message
    res.status(201).json({
      message: `Thank you, ${user.firstName}, for scheduling a campaign! Enjoy a 10% discount on your next campaign.`,
      communicationLog,
    });
  } catch (err) {
    console.error('Error in createScheduledCampaign:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// // Creates a scheduled or regular campaign
// exports.createScheduledCampaign = async (req, res) => {
//   try {
//     console.log('Received request to create scheduled campaign:', req.body);

//     await validateCreateCampaignRequest(req);

//     const { rules, message, logicalOperator, scheduledAt, isAutomated, trigger } = req.body;

//     // Retrieve googleId from request body or session
//     const googleId = req.body.googleId || req.session?.googleId;
//     if (!googleId) {
//       return res.status(400).json({ error: 'googleId is required' });
//     }

//     // Get audience size
//     const audience = await getAudienceSize(rules, logicalOperator);
//     const audienceSize = audience.length;

//     // Create and save the communication log
//     const communicationLog = new CommunicationLog({
//       googleId, // Use googleId instead of userId
//       audience,
//       message,
//       scheduledAt: scheduledAt || null,
//       status: scheduledAt ? 'PENDING' : 'SENT',
//       isAutomated: isAutomated || false,
//       trigger: trigger || null,
//     });

//     await communicationLog.save();
//     console.log('Communication log saved:', communicationLog);

//     // If not scheduled, send immediately
//     if (!scheduledAt) {
//       await exports.sendCampaign(communicationLog);
//     }

//     // Return the saved communication log and googleId
//     res.status(201).json({
//       message: 'Campaign created successfully!',
//       googleId,
//       communicationLog,
//     });
//   } catch (err) {
//     console.error('Error in createScheduledCampaign:', err.message);
//     res.status(400).json({ error: err.message });
//   }
// };


// exports.getCampaigns = async (req, res) => {
//   try {
//     console.log('Received request to get campaigns');

//     const campaigns = await CommunicationLog.find().sort({ sentAt: -1 });
//     res.json(campaigns);
//   } catch (err) {
//     console.error('Error in getCampaigns:', err.message);
//     res.status(400).json({ error: err.message });
//   }
// };

// // Deletes a specific campaign by ID
// exports.deleteCampaign = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedCampaign = await CommunicationLog.findByIdAndDelete(id);

//     if (!deletedCampaign) {
//       return res.status(404).json({ error: 'Campaign not found' });
//     }

//     res.status(200).json({ message: 'Campaign deleted successfully' });
//   } catch (err) {
//     console.error('Error in deleteCampaign:', err.message);
//     res.status(500).json({ error: 'Failed to delete campaign' });
//   }
// };

exports.getCampaigns = async (req, res) => {
  try {
    const { googleId } = req.query; // Retrieve googleId from query parameters

    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required' });
    }

    // Query campaigns using googleId
    const campaigns = await CommunicationLog.find({ googleId }).sort({ sentAt: -1 });

    res.json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ error: 'An error occurred while fetching campaigns' });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId; // Ensure only the creator can delete

    const deletedCampaign = await CommunicationLog.findOneAndDelete({ _id: id, userId });
    if (!deletedCampaign) {
      return res.status(404).json({ error: 'Campaign not found or not authorized' });
    }

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};


exports.checkAudienceSize = async (req, res) => {
  try {
    console.log('Received request to check audience size:', req.body);

    await validateCreateCampaignRequest(req);

    const { rules, logicalOperator } = req.body;
    const audience = await getAudienceSize(rules, logicalOperator);

    console.log('Audience size checked:', audience.length);
    res.json({ audienceSize: audience.length });
  } catch (err) {
    console.error('Error in checkAudienceSize:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Validates campaign creation request, including message and optional rules
const validateCreateCampaignRequest = async (req) => {
  console.log('Validating request:', req.body);

  const validations = [
    body('rules').optional().isArray().withMessage('Rules must be an array'),
    body('rules.*.field').exists().withMessage('Each rule must have a field').isString().withMessage('Field must be a string'),
    body('rules.*.operator').exists().withMessage('Each rule must have an operator').isString().withMessage('Operator must be a string'),
    body('rules.*.value').exists().withMessage('Each rule must have a value'),
    body('message').exists().withMessage('Message is required').isString().withMessage('Message must be a string'),
    body('logicalOperator').optional().isString().withMessage('Logical operator must be a string').isIn(['AND', 'OR']).withMessage('Logical operator must be either AND or OR'),
    body('scheduledAt').optional().isISO8601().withMessage('Scheduled time must be a valid date'),
  ];

  await Promise.all(validations.map(validation => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    console.error('Validation errors:', errorMessages);
    throw new Error(errorMessages);
  }

  console.log('Validation successful');
};

const getAudienceSize = async (rules, logicalOperator) => {
  console.log('Getting audience size for rules:', rules, 'with logical operator:', logicalOperator);

  const queryConditions = rules.map(rule => {
    const condition = {};
    condition[rule.field] = { [getMongoOperator(rule.operator)]: parseFieldValue(rule.field, rule.value) };
    return condition;
  });

  const query = logicalOperator === 'AND' ? { $and: queryConditions } : { $or: queryConditions };
  console.log('Query generated:', query);

  const customers = await Customer.find(query);
  const audience = customers.map(customer => ({
    name: customer.name,
    email: customer.email,
  }));

  console.log('Audience found:', audience);

  return audience;
};

const parseFieldValue = (field, value) => {
  switch (field) {
    case 'totalSpend':
      return parseFloat(value);
    case 'numVisits':
      return parseInt(value);
    case 'lastVisitDate':
      return new Date(value);
    default:
      throw new Error(`Unsupported field: ${field}`);
  }
};

const getMongoOperator = (operator) => {
  switch (operator) {
    case '>':
      return '$gt';
    case '>=':
      return '$gte';
    case '<':
      return '$lt';
    case '<=':
      return '$lte';
    case '=':
      return '$eq';
    case '!=':
      return '$ne';
    default:
      throw new Error(`Unsupported operator:${operator}`);
  }
};

// Sends a campaign immediately or queues for scheduled campaigns
const sendCampaign = async (communicationLog) => {
  console.log('Simulating sending campaign for communication log:', communicationLog);

  const vendorResponses = communicationLog.audience.map(customer => ({
    id: communicationLog._id,
    customer: customer,
    status: Math.random() < 0.9 ? 'SENT' : 'FAILED', // 90% chance of "SENT", 10% "FAILED"
  }));

  for (const response of vendorResponses) {
    console.log('Publishing message to queue:', response);

    await queueService.publishMessage({
      type: 'UPDATE_COMMUNICATION_LOG',
      payload: response,
    });
  }

  communicationLog.status = 'SENT';
  communicationLog.sentAt = new Date();
  await communicationLog.save();

  console.log('Campaign simulation complete');
};

// Export the sendCampaign function for use in other modules
exports.sendCampaign = sendCampaign;