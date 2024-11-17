const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db.config'); 
const passport = require('./services/auth.service'); 
require('dotenv').config();

const app = express();
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); 

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// Passport middleware 
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth.routes')); 
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/orders', require('./routes/order.routes')); 
app.use('/api/campaigns', require('./routes/campaign.routes'));
app.use('/api/admin', require('./routes/admin.routes'));


require('./services/scheduler');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
