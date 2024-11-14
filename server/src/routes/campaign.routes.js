const express = require('express');
const { check } = require('express-validator');
const { createScheduledCampaign, getCampaigns, checkAudienceSize, deleteCampaign } = require('../controllers/campaign.controller');
const router = express.Router();

// Route for creating a new audience and scheduling campaigns
router.post(
  '/create-scheduled',
  [
    check('rules').optional().isArray().withMessage('Rules must be an array'),
    check('rules.*.field').isString().withMessage('Field must be a string'),
    check('rules.*.operator').isString().withMessage('Operator must be a string'),
    check('rules.*.value').notEmpty().withMessage('Value must be provided'),
    check('message').isString().withMessage('Message must be a string'),
    check('scheduledAt').optional().isISO8601().withMessage('Scheduled time must be a valid date'),
    check('isAutomated').optional().isBoolean().withMessage('isAutomated must be a boolean value'),
    check('trigger').optional().isString().withMessage('Trigger must be a string')
      .isIn(['newCustomer', 'inactiveCustomer']).withMessage('Trigger must be either newCustomer or inactiveCustomer')
  ],
  createScheduledCampaign
);

// Route for creating audience without scheduling
router.post(
  '/create-audience',
  [
    check('rules').isArray().withMessage('Rules must be an array'),
    check('rules.*.field').isString().withMessage('Field must be a string'),
    check('rules.*.operator').isString().withMessage('Operator must be a string'),
    check('rules.*.value').notEmpty().withMessage('Value must be provided'),
    check('message').isString().withMessage('Message must be a string')
  ],
  createScheduledCampaign // Use createScheduledCampaign function to handle both immediate and scheduled campaigns
);

// Route for checking audience size
router.post(
  '/check-audience-size',
  [
    check('rules').isArray().withMessage('Rules must be an array'),
    check('rules.*.field').isString().withMessage('Field must be a string'),
    check('rules.*.operator').isString().withMessage('Operator must be a string'),
    check('rules.*.value').notEmpty().withMessage('Value must be provided')
  ],
  checkAudienceSize
);

// Route to get all campaigns
router.get('/', getCampaigns);
// to delete a specific campaign 
router.delete('/:id', deleteCampaign);

module.exports = router;
