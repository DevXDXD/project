const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  googleId: { type: String, ref: 'User', required: true }, // Reference googleId from User schema
  audience: { type: mongoose.Schema.Types.Mixed },
  message: { type: String, required: true },
  sentAt: { type: Date, default: null },
  scheduledAt: { type: Date, required: false },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  isAutomated: { type: Boolean, default: false },
  trigger: { type: String, enum: ['newCustomer', 'inactiveCustomer'], required: false }
});

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

module.exports = CommunicationLog;
