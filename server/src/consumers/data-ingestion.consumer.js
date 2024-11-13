const { consumeMessages } = require('../services/queue.service');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const connectDB = require('../config/db.config');

const handleMessage = async (message) => {
  try {
    console.log(`[x] Received message: ${JSON.stringify(message)}`);
    switch (message.type) {
      case 'CREATE_CUSTOMER':
        console.log(`[x] Handling CREATE_CUSTOMER with payload: ${JSON.stringify(message.payload)}`);
        try {
          const customer = new Customer(message.payload);
          await customer.save();
          console.log(`[x] Customer created: ${JSON.stringify(customer)}`);
        } catch (err) {
          console.error(`[x] Error creating customer: ${err.message}`);
        }
        break;
        
      case 'CREATE_ORDER':
        console.log(`[x] Handling CREATE_ORDER with payload: ${JSON.stringify(message.payload)}`);
        try {
          const order = new Order(message.payload);
          console.log(order)
          await order.save();
          console.log(`[x] Order created: ${JSON.stringify(order)}`);
        } catch (err) {
          console.error(`[x] Error creating order: ${err.message}`);
          break;
        }

        // Update customer's totalSpend and numVisits
        try {
          const order = new Order(message.payload);
          const customerId = order.customerId;
    
          console.log(`[x] Fetching customer with ID: ${customerId}`);
          const customerObj = await Customer.findById(customerId);
          if (customerObj) {
            console.log(`[x] Customer found: ${JSON.stringify(customerObj)}`);
            customerObj.totalSpend += order.amount;
            customerObj.numVisits += 1;
            customerObj.lastVisitDate = new Date();
            await customerObj.save();
            console.log(`[x] Customer updated: ${JSON.stringify(customerObj)}`);
          } else {
            console.error(`[x] Customer with ID ${customerId} not found`);
          }
        } catch (err) {
          console.error(`[x] Error updating customer: ${err.message}`);
        }
        break;
        
      case 'UPDATE_COMMUNICATION_LOG':
        // No operation for this case
        break;
        
      default:
        console.log(`[x] Unhandled message type: ${message.type}`);
    }
  } catch (err) {
    console.error(`[x] Error handling message: ${err.message}`);
  }
};

const startConsumer = async () => {
  try {
    console.log('[x] Connecting to database...');
    await connectDB();
    console.log('[x] Connected to database');
    console.log('[x] Starting to consume messages...');
    consumeMessages(handleMessage);
  } catch (err) {
    console.error(`[x] Error starting consumer: ${err.message}`);
  }
};

startConsumer();
