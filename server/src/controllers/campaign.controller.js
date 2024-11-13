const { validationResult, body } = require('express-validator');
const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');
const queueService = require('../services/queue.service');

exports.createAudience = async (req, res) => {
  try {
    console.log('Received request to create audience:', req.body);

    // Validation
    await validateCreateAudienceRequest(req);

    const { rules, message, logicalOperator } = req.body;
    console.log('Validation successful. Rules:', rules, 'Message:', message, 'LogicalOperator:', logicalOperator);

    const audience = await getAudienceSize(rules, logicalOperator);
    const audienceSize = audience.length;
    console.log('Audience size:', audienceSize);

    // Append the audience size to the audience array
    audience.push({ audienceSize });

    const communicationLog = new CommunicationLog({ audience, message });
    await communicationLog.save();

    console.log('Communication log saved:', communicationLog);

    // Simulate sending campaign
    sendCampaign(communicationLog);

    res.status(201).json(communicationLog);
  } catch (err) {
    console.error('Error in createAudience:', err.message);
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

exports.checkAudienceSize = async (req, res) => {
  try {
    console.log('Received request to check audience size:', req.body);

    await validateCreateAudienceRequest(req);

    const { rules, logicalOperator } = req.body;
    const audience = await getAudienceSize(rules, logicalOperator);
    
    console.log('Audience size checked:', audience.length);
    res.json({ audienceSize: audience.length });
  } catch (err) {
    console.error('Error in checkAudienceSize:', err.message);
    res.status(400).json({ error: err.message });
  }
};

const validateCreateAudienceRequest = async (req) => {
  console.log('Validating request:', req.body);

  const validations = [
    body('rules').isArray().withMessage('Rules must be an array'),
    body('rules.*.field').exists().withMessage('Each rule must have a field').isString().withMessage('Field must be a string'),
    body('rules.*.operator').exists().withMessage('Each rule must have an operator').isString().withMessage('Operator must be a string'),
    body('rules.*.value').exists().withMessage('Each rule must have a value'),
    body('message').exists().withMessage('Message is required').isString().withMessage('Message must be a string'),
    body('logicalOperator').exists().withMessage('Logical operator is required').isString().withMessage('Logical operator must be a string').isIn(['AND', 'OR']).withMessage('Logical operator must be either AND or OR'),
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

const sendCampaign = async (communicationLog) => {
  console.log('Simulating sending campaign for communication log:', communicationLog);

  // Simulate sending the campaign to a dummy vendor API
  const vendorResponses = [
    { id: communicationLog._id, status: 'SENT' },
    { id: communicationLog._id, status: 'FAILED' },
    // Add more dummy responses as needed
  ];

  for (const response of vendorResponses) {
    console.log('Publishing message to queue:', response);

    await queueService.publishMessage({
      type: 'UPDATE_COMMUNICATION_LOG',
      payload: response,
    });
  }

  console.log('Campaign simulation complete');
};
