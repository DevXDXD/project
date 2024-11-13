const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  totalSpend: { type: Number, default: 0 },
  numVisits: { type: Number, default: 0 },
  lastVisitDate: { type: Date },
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;