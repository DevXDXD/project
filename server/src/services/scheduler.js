const cron = require('node-cron');
const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');
const { sendCampaign } = require('../controllers/campaign.controller');  

const processPendingCampaigns = async () => {
  console.log('Checking for scheduled campaigns...');

  const campaigns = await CommunicationLog.find({
    scheduledAt: { $lte: new Date() },
    status: 'PENDING'
  });

  for (const campaign of campaigns) {
    try {
      await sendCampaign(campaign);
      campaign.status = 'SENT';
      await campaign.save();
      console.log(`Scheduled campaign ${campaign._id} sent successfully.`);
    } catch (error) {
      console.error(`Failed to send campaign ${campaign._id}:`, error.message);
      campaign.status = 'FAILED';
      await campaign.save();
    }
  }
};

// Helper function to process inactive customer campaigns
const processInactiveCustomerCampaigns = async () => {
  console.log('Checking for automated campaigns for inactive customers...');
  
  const inactiveCustomers = await Customer.find({
    lastVisitDate: { $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  });

  const inactiveCampaigns = await CommunicationLog.find({
    isAutomated: true,
    trigger: 'inactiveCustomer'
  });

  for (const campaign of inactiveCampaigns) {
    for (const customer of inactiveCustomers) {
      try {
        await sendCampaign(campaign, customer);
      } catch (error) {
        console.error(`Failed to send campaign ${campaign._id} to customer ${customer._id}:`, error.message);
      }
    }
  }
};

// Cron job to check and send scheduled campaigns every minute
cron.schedule('* * * * *', processPendingCampaigns);

// Automated Campaign for Inactive Customers - Runs daily at midnight
cron.schedule('0 0 * * *', processInactiveCustomerCampaigns);

module.exports = cron;
