// order.routes.js
const express = require('express');
const orderController = require('../controllers/order.controller');
const router = express.Router();

router.post('/', orderController.createOrder);

module.exports = router;
