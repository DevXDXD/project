const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  audience: { type: mongoose.Schema.Types.Mixed },
  message: { type: String, required: true },
  sentAt: { type: Date, default: null },                 // Actual time sent
  scheduledAt: { type: Date, required: false },          // Scheduled time for sending
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  isAutomated: { type: Boolean, default: false },        // Flag for automated campaigns
  trigger: { type: String, enum: ['newCustomer', 'inactiveCustomer'], required: false }  // Trigger condition
});

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

module.exports = CommunicationLog;
