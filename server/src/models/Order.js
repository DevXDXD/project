const mongoose = require('mongoose');
const Customer = require('./Customer');

const orderSchema = new mongoose.Schema({
  googleId: { type: String, ref: 'User', required: true }, // Reference googleId from User schema
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
