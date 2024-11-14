const { validationResult, body } = require('express-validator');
const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');
const queueService = require('../services/queue.service');

// Creates a scheduled or regular campaign
exports.createScheduledCampaign = async (req, res) => {
  try {
    console.log('Received request to create scheduled campaign:', req.body);

    await validateCreateCampaignRequest(req);

    const { rules, message, logicalOperator, scheduledAt, isAutomated, trigger } = req.body;
    const audience = await getAudienceSize(rules, logicalOperator);
    const audienceSize = audience.length;

    // Prepare the campaign with additional fields for scheduling and automation
    const communicationLog = new CommunicationLog({
      audience,
      message,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? 'PENDING' : 'SENT',  // If scheduled, set status to 'PENDING'
      isAutomated: isAutomated || false,
      trigger: trigger || null,
    });
    
    await communicationLog.save();
    console.log('Communication log saved:', communicationLog);

    // If not scheduled, send immediately
    if (!scheduledAt) {
      await exports.sendCampaign(communicationLog);
    }

    res.status(201).json({ message: 'Campaign created successfully!', communicationLog });
  } catch (err) {
    console.error('Error in createScheduledCampaign:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    console.log('Received request to get campaigns');

    const campaigns = await CommunicationLog.find().sort({ sentAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error('Error in getCampaigns:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Deletes a specific campaign by ID
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCampaign = await CommunicationLog.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('Error in deleteCampaign:', err.message);
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
      throw new Error(`Unsupported operator: ${operator}`);
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
