const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  audience: { type: mongoose.Schema.Types.Mixed},
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
});

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

module.exports = CommunicationLog;